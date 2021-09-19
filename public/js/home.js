var global = {"connected": false, "balance": 0.0, "jobDocs": []};

function logout(){
    firebase.auth().signOut().then(function(){
        window.location.href = "/";
    });
}

function loadUserData(){
    document.getElementById("spanBalance").innerHTML = "<span class='spinner-border spinner-border-sm'></span>";
    document.getElementById("listRecur").innerHTML = "<span class='spinner-border spinner-border-sm'></span>";
    UserManager.getUser(firebaseUser.uid).then(function(userDoc){
        var user = userDoc.data();
        loadUserJobs(userDoc);

        //configure UI elements for user
        if(user.key && user.key.length > 0){
            //found user and key
            document.getElementById("spanKeyPeek").innerHTML = user.key;
            document.getElementById("memberContent").style.display = "block";
            document.getElementById("btnAddKey").style.display = "none";
            document.getElementById("keySection").style.display = "block";

            var req = firebase.functions().httpsCallable("getBalance");
            req().then(function(response){
                if(response && response.data){
                    console.log(response);
                    var data = JSON.parse(response.data);
                    if(Array.isArray(data)){
                        //find usd
                        var portfolio = data;
                        var usd = -1;
                        for(var i=0;i<portfolio.length;i++){
                            var wallet = portfolio[i];
                            if(wallet.currency == "USD"){
                                usd = wallet.balance;
                                global.connected = true;
                                global.balance = usd;
                            }
                        }
                        renderUserJobs(global.jobDocs);
                        document.getElementById("spanBalance").innerHTML = usd + " USD";
                        document.getElementById("spanBalance").style.color = "green";
                    }
                    else{
                        document.getElementById("spanBalance").innerHTML = "Unable to connect to Coinbase.";
                        document.getElementById("spanBalance").style.color = "red";
                        if(data.message && data.message.length > 0){
                            document.getElementById("spanBalance").innerHTML += " " + data.message;
                        }
                    }
                }
            });
        }
        else{
            //found user, but no key
            document.getElementById("btnAddKey").style.display = "block";
            document.getElementById("keySection").style.display = "none";
            document.getElementById("spanBalance").innerHTML = "Unable to connect to Coinbase. Add an API-Key.";
            document.getElementById("spanBalance").style.color = "red";
        }
    })
    .catch(function(err){
        console.error(err);
        //no user found
        UserManager.createUser(firebaseUser).then(function(){
            loadUserData();
        });
    });
}

function loadUserJobs(userDoc){
    UserManager.getUserJobs(userDoc).then(function(jobDocs){
        global.jobDocs = jobDocs;
        renderUserJobs(jobDocs);
    })
    .catch(function(err){
        console.error(err);    
    });
}

function renderUserJobs(jobDocs){
    document.getElementById("listRecur").innerHTML = "";
    for(var i=0;i<jobDocs.length;i++){
        var jobDoc = jobDocs[i];
        var job = jobDoc.data();
        var tooltip = "";
        var status = "inactive";
        if(global.connected && global.balance > job.amount){
            status = "active";
            tooltip = status;
        }
        else{
            if(!global.connected){
                status = "inactive";
                tooltip = "Unable to connect to Coinbase.";
            }
            else{
                status = "inactive";
                tooltip = "Insufficent funds.";
            }
        }
        var html = "<div class='job' title='{tooltip}' onclick='loadViewModal(\"{jobId}\")')'><span class='{status}'>&nbsp;</span> Buy {currency}, {amount} every {recur} day(s) <i class='bi-pencil-fill' style='float:right'></i></div>";
        html = html.replace("{jobId}", jobDoc.id);
        html = html.replace("{status}", status);
        html = html.replace("{tooltip}", tooltip);
        html = html.replace("{currency}", job.asset);
        html = html.replace("{amount}", "$"+job.amount);
        html = html.replace("{recur}", job.recurDays);
        document.getElementById("listRecur").innerHTML += html;
    }
}

function addApiKey(){
    var newKey = document.getElementById("txtKey").value;
    var newSecret = document.getElementById("txtSecret").value;
    var newPassphrase = document.getElementById("txtPassphrase").value;
    UserManager.addUserKey(firebaseUser.uid, newKey, newSecret, newPassphrase).then(function(response){
        $("#addKeyModal").modal("hide");
        loadUserData();
    });
}

function removeApiKey(){
    var affirm = confirm("Are you sure you want to remove your api key?");
    if(affirm){
        UserManager.removeUserKey(firebaseUser.uid).then(function(response){
            loadUserData();
        });
    }
}

function loadViewModal(jobId){
    document.getElementById("alertFundsWarning").style.display = "none";
    UserManager.getUserJob(firebaseUser.uid, jobId).then(function(jobDoc){
        var job = jobDoc.data();
        document.getElementById("viewJobId").value = jobId;
        document.getElementById("spanViewAsset").innerHTML = job.asset;
        document.getElementById("spanViewAmount").innerHTML = job.amount;
        document.getElementById("spanViewRecur").innerHTML = job.recurDays;
        document.getElementById("spanViewCreated").innerHTML = job.created.toDate().toUTCString();
        document.getElementById("spanViewNext").innerHTML = job.nextPurchaseDate.toDate().toUTCString();
        if(!global.connected){
            document.getElementById("alertFundsWarning").style.display = "block";
            document.getElementById("alertFundsWarning").innerHTML = "Unable to connect to Coinbase Pro. Make sure you have added a valid API-Key.";
        }
        else if(global.balance < job.amount){
            document.getElementById("alertFundsWarning").style.display = "block";
            document.getElementById("alertFundsWarning").innerHTML = "Insufficent funds. Deposit more USD into your Coinbase Pro account before next purchase date.";
        }
    });
    $("#viewPurchaseModal").modal("show");
}

function addRecur(){
    var job = {};
    job.asset = document.getElementById("selectAsset").value;
    job.amount = parseFloat(document.getElementById("txtAmount").value);
    job.recurDays = parseInt(document.getElementById("txtRecur").value);
    job.created = new Date();
    job.nextPurchaseDate = addDays(job.created, job.recurDays);
    job.nextPurchaseDate.setUTCHours(12,0,0,0);

    if(job.amount < 1){
        alert("The amount must be at least 1");
        return;
    }
    if(job.recurDays < 1){
        alert("The number of days must be at least 1");
        return;
    }
    UserManager.createJob(firebaseUser.uid, job).then(function(response){
        $("#addPurchaseModal").modal("hide");
        loadUserData();
    });
}

function deleteRecur(){
    var affirm = confirm("Are you sure you want to delete this recurring purchase?");
    if(affirm){
        var jobId = document.getElementById("viewJobId").value;
        UserManager.deleteJob(firebaseUser.uid, jobId).then(function(response){
            $("#viewPurchaseModal").modal("hide");
            loadUserData();
        });
    }
}

function addDays(date, days) {
    var result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }