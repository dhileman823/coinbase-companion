var _state = {
    "firebaseUser":null,
    "user":null,
    "jobs":[],
    "cbBalance":-1,
    "cbPaymentMethodId":null,
    "cbPaymentMethodName":null
};

function onPageLoad(firebaseUser){
    _state.firebaseUser = firebaseUser;

    //create settings widget
    var widget = SettingsWidgetFactory.newSettingsWidget();
    widget.placeAt(this.document.getElementById("panelSettings"));
    //create order widget

    //get user and jobs objects
    if(firebaseUser){
        UserManager.getUser(firebaseUser.uid).then(function(userDoc){
            if(userDoc.exists){
                var user = userDoc.data();
                console.log(user);
                _state.user = user;
                loadCoinbaseData();
            }
            else{
                initNewUser();
            }
        });
    }

    //trigger UI updates with new data
    //widget.rerender?
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
            console.log(r);
        });
    }
}

async function getBalance(){
    if(_state.firebaseUser && _state.user){
        var requestBalance = firebase.functions().httpsCallable("getBalance");
        var response = await requestBalance();
        var accounts = JSON.parse(response.data);
        return accounts;
    }
    return null;
}

function logout(){
    firebase.auth().signOut().then(function(){
        window.location.href = "main.html";
    });
}