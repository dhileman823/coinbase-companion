var _state = {
    "firebaseUser":null,
    "user":null,
    "jobs":[],
    "cbBalance":null,
    "cbPaymentMethodId":null,
    "cbPaymentMethodName":null,
    "widgets":[],
};

function onPageLoad(firebaseUser){
    _state.firebaseUser = firebaseUser;

    //create settings widget
    var settingsWidget = SettingsWidgetFactory.newSettingsWidget();
    settingsWidget.placeAt(this.document.getElementById("panelSettings"));
    _state.widgets.push(settingsWidget);
    //create order widget

    //get user and jobs objects
    if(firebaseUser){
        UserManager.getUser(firebaseUser.uid).then(function(userDoc){
            if(userDoc.exists){
                var user = userDoc.data();
                user.key = shortenKey(user.key);
                console.log(user.email);
                _state.user = user;
                settingsWidget.reload();
                loadCoinbaseData();
            }
            else{
                initNewUser();
            }
        });
    }
}

function shortenKey(key){
    var newKey = "";
    if(key.length > 13){
        newKey = key.substring(0,5)+"..."+key.substring(key.length-5,key.length);
    }
    else{
        newKey = key;
    }
    return newKey;
}

function initNewUser(){
    console.log("Init first time user");
    UserManager.createUser(firebaseUser).then(function(response){
        console.log(response);
        if(response == UserManager.RESPONSE_USER_CREATED){
            window.location.href = "main.html";
        }
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
                    _state.widgets[0].reload();
                }
            }
        });
        getPaymentMethod().then(function(r){
            if(Array.isArray(r)){
                for(var i=0;i<r.length;i++){
                    var pm = r[i];
                    if(pm.currency === "USD" && pm.primary_buy){
                        _state.cbPaymentMethodId = pm.id;
                        _state.cbPaymentMethodName = pm.name;
                        _state.widgets[0].reload();
                        break;
                    }
                }
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
            accounts = JSON.parse(response.data);
        }
        catch(e){
            console.log(e);
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
            methods = JSON.parse(response.data);
        }
        catch(e){
            console.error(e);
            methods = e;
        }
        return methods;
    }
    return null;
}

function logout(){
    firebase.auth().signOut().then(function(){
        window.location.href = "main.html";
    });
}