var _state = {
    "firebaseUser":null,
    "user":null,
    "jobs":[],
    "transactions":[],
    "cbBalance":null,
    "cbPaymentMethodId":null,
    "cbPaymentMethodName":null,
    "widgets":{},
};

function onPageLoad(firebaseUser){
    _state.firebaseUser = firebaseUser;

    //create settings widget
    var settingsWidget = SettingsWidgetFactory.newSettingsWidget();
    settingsWidget.placeAt(this.document.getElementById("panelSettings"));
    _state.widgets.settingsWidget = settingsWidget;

    //create jobs widget
    var jobsWidget = JobsWidgetFactory.newJobsWidget();
    jobsWidget.placeAt(this.document.getElementById("panelJobs"));
    _state.widgets.jobsWidget = jobsWidget;

    //get user and jobs objects
    if(firebaseUser){
        UserManager.getUser(firebaseUser.uid).then(function(userDoc){
            if(userDoc.exists){
                var user = userDoc.data();
                _state.user = user;
                _state.userDoc = userDoc;
                jobsWidget.reload();
                settingsWidget.reload();
                loadJobsData();
                loadTransactionsData();
                loadCoinbaseData();
            }
            else{
                initNewUser();
            }
        });
    }
}

function initNewUser(){
    console.log("First time user");
    UserManager.createUser(firebaseUser).then(function(response){
        if(response == UserManager.RESPONSE_USER_CREATED){
            window.location.href = "/";
        }
    });
}

function goToSettings(){
    $("#settings-tab").tab("show");
}

function loadJobsData(){
    UserManager.getUserJobs(_state.userDoc).then(function(jobs){
        _state.jobs = jobs;
        _state.widgets.jobsWidget.reload();
    })
    .catch(function(err){
        console.error(err);    
    });
}

function loadTransactionsData(){
    UserManager.getUserTransactions(_state.userDoc).then(function(txs){
        _state.transactions = txs;
        _state.widgets.jobsWidget.reload();
    })
    .catch(function(err){
        console.error(err);    
    });
}

function loadCoinbaseData(){
    if(_state.user && _state.user.key && _state.user.key.length > 0){
        getBalance().then(function(r){
            if(Array.isArray(r)){
                var result = r.find(obj => {
                    return obj.currency === "USD"
                });
                if(result){
                    _state.cbBalance = result.available;
                    _state.widgets.jobsWidget.reload();
                    _state.widgets.settingsWidget.reload();
                }
            }
            else{
                _state.cbBalance = r;
                _state.widgets.jobsWidget.reload();
                _state.widgets.settingsWidget.reload();
            }
        });
        getPaymentMethod().then(function(r){
            if(Array.isArray(r)){
                for(var i=0;i<r.length;i++){
                    var pm = r[i];
                    if(pm.currency === "USD" && pm.primary_buy){
                        _state.cbPaymentMethodId = pm.id;
                        _state.cbPaymentMethodName = pm.name;
                        _state.widgets.jobsWidget.reload();
                        _state.widgets.settingsWidget.reload();
                        break;
                    }
                }
            }
            else{
                _state.cbPaymentMethodName = r;
                _state.widgets.jobsWidget.reload();
                _state.widgets.settingsWidget.reload();
            }
        });
    }
}

async function getBalance(){
    if(_state.firebaseUser && _state.user && _state.user.key.length > 0){
        var requestBalance = firebase.functions().httpsCallable("getBalance");
        var accounts;
        try{
            var response = await requestBalance();
            if(response && response.data){
                var data = JSON.parse(response.data);
                if(data.message){
                    console.error(data.message);
                    accounts = data.message;
                }
                if(Array.isArray(data)){
                    accounts = data;
                }
            }
        }
        catch(e){
            console.error(e);
            accounts = e;
        }
        
        return accounts;
    }
    return null;
}

async function getPaymentMethod(){
    if(_state.firebaseUser && _state.user && _state.user.key.length > 0){
        var requestPaymentMethods = firebase.functions().httpsCallable("getPaymentMethods");
        var methods;
        try{
            var response = await requestPaymentMethods();
            if(response && response.data){
                var data = JSON.parse(response.data);
                if(data.message){
                    console.error(data.message);
                    methods = data.message;
                }
                if(Array.isArray(data)){
                    methods = data;
                }
            }
        }
        catch(e){
            console.error(e);
            methods = e;
        }
        return methods;
    }
    return null;
}

async function doTestDeposit(){
    var amount = document.getElementById("txtTestAmountDeposit").value;
    var paymentMethodId = document.getElementById("txtTestPaymentMethodId").value;
    if(_state.firebaseUser && _state.user && _state.user.key.length > 0){
        var requestDoDeposit = firebase.functions().httpsCallable("doDeposit");
        try{
            var response = await requestDoDeposit({"amount":amount, "paymentMethodId":paymentMethodId});
            console.log(response);
            if(response && response.data){
                var data = JSON.parse(response.data);
                if(data.message){
                    console.error(data.message);
                }
            }
        }
        catch(e){
            console.error(e);
        }
        //return methods;
    }
    return null;
}

async function doTestOrder(){
    var amount = document.getElementById("txtTestAmountOrder").value;
    if(_state.firebaseUser && _state.user && _state.user.key.length > 0){
        var requestDoOrder = firebase.functions().httpsCallable("doOrder");
        try{
            var response = await requestDoOrder({"amount":amount, "product":"BTC-USD"});
            console.log(response);
            if(response && response.data){
                var data = JSON.parse(response.data);
                if(data.message){
                    console.error(data.message);
                }
            }
        }
        catch(e){
            console.error(e);
        }
    }
}

function logout(){
    firebase.auth().signOut().then(function(){
        window.location.href = "/";
    });
}

function addRecurDeposit(){
    var job = {};
    job.asset = "USD";
    job.paymentMethod = document.getElementById("selectPaymentMethod").value;
    job.amount = parseFloat(document.getElementById("txtAmountDeposit").value);
    job.recurDays = parseInt(document.getElementById("txtRecurDeposit").value);
    job.created = new Date();
    job.nextPurchaseDate = addDays(job.created, job.recurDays);
    job.nextPurchaseDate.setUTCHours(12,0,0,0);
    job.type = "deposit";

    if(job.amount < 1){
        alert("The amount must be at least 1");
        return;
    }
    if(job.recurDays < 1){
        alert("The number of days must be at least 1");
        return;
    }
    UserManager.createJob(_state.firebaseUser.uid, job).then(function(response){
        $("#addDepositModal").modal("hide");
        loadJobsData();
    });
}

function addRecurOrder(){
    var job = {};
    job.asset = document.getElementById("selectAsset").value;
    job.amount = parseFloat(document.getElementById("txtAmount").value);
    job.recurDays = parseInt(document.getElementById("txtRecur").value);
    job.created = new Date();
    job.nextPurchaseDate = addDays(job.created, job.recurDays);
    job.nextPurchaseDate.setUTCHours(12,0,0,1);
    job.type = "order";

    if(job.amount < 1){
        alert("The amount must be at least 1");
        return;
    }
    if(job.recurDays < 1){
        alert("The number of days must be at least 1");
        return;
    }
    UserManager.createJob(_state.firebaseUser.uid, job).then(function(response){
        $("#addPurchaseModal").modal("hide");
        loadJobsData();
    });
}

function deleteRecurDeposit(){
    var affirm = confirm("Are you sure you want to delete this recurring deposit?");
    if(affirm){
        var jobId = document.getElementById("viewDepositJobId").value;
        UserManager.deleteJob(_state.firebaseUser.uid, jobId).then(function(response){
            $("#viewDepositModal").modal("hide");
            loadJobsData();
        });
    }
}

function deleteRecurOrder(){
    var affirm = confirm("Are you sure you want to delete this recurring purchase?");
    if(affirm){
        var jobId = document.getElementById("viewJobId").value;
        UserManager.deleteJob(_state.firebaseUser.uid, jobId).then(function(response){
            $("#viewPurchaseModal").modal("hide");
            loadJobsData();
        });
    }
}

function loadViewModal(jobId){
    document.getElementById("alertFundsWarning").style.display = "none";
    UserManager.getUserJob(_state.firebaseUser.uid, jobId).then(function(jobDoc){
        var job = jobDoc.data();
        document.getElementById("viewJobId").value = jobId;
        document.getElementById("spanViewAsset").innerHTML = job.asset;
        document.getElementById("spanViewAmount").innerHTML = job.amount;
        document.getElementById("spanViewRecur").innerHTML = job.recurDays;
        document.getElementById("spanViewCreated").innerHTML = job.created.toDate().toUTCString();
        document.getElementById("spanViewNext").innerHTML = job.nextPurchaseDate.toDate().toUTCString();
        if(!_state.cbBalance){
            document.getElementById("alertFundsWarning").style.display = "block";
            document.getElementById("alertFundsWarning").innerHTML = "Unable to connect to Coinbase Pro. Make sure you have added a valid API-Key.";
        }
        else if(_state.balance && _state.balance < job.amount){
            document.getElementById("alertFundsWarning").style.display = "block";
            document.getElementById("alertFundsWarning").innerHTML = "Insufficent funds. Deposit more USD into your Coinbase Pro account before next purchase date.";
        }
    });
    $("#viewPurchaseModal").modal("show");
}

function loadDepositViewModal(jobId){
    document.getElementById("alertDepositWarning").style.display = "none";
    UserManager.getUserJob(_state.firebaseUser.uid, jobId).then(function(jobDoc){
        var job = jobDoc.data();
        document.getElementById("viewDepositJobId").value = jobId;
        document.getElementById("spanViewPaymentMethod").innerHTML = job.paymentMethod;
        document.getElementById("spanViewDepositAmount").innerHTML = job.amount;
        document.getElementById("spanViewDepositRecur").innerHTML = job.recurDays;
        document.getElementById("spanViewDepositCreated").innerHTML = job.created.toDate().toUTCString();
        document.getElementById("spanViewDepositNext").innerHTML = job.nextPurchaseDate.toDate().toUTCString();
        if(!_state.cbBalance){
            document.getElementById("alertDepositWarning").style.display = "block";
            document.getElementById("alertDepositWarning").innerHTML = "Unable to connect to Coinbase Pro. Make sure you have added a valid API-Key.";
        }
        if(_state.cbPaymentMethodId == job.paymentMethod){
            document.getElementById("spanViewPaymentMethod").innerHTML = _state.cbPaymentMethodName;
        }
        else{
            document.getElementById("spanViewPaymentMethod").innerHTML = "Not available";
        }
    });
    $("#viewDepositModal").modal("show");
}

function addDays(date, days) {
    var result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
}