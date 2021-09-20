var _state = {
    "firebaseUser":null,
    "user":{},
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
    //trigger UI updates with new 

    //get coinbase balance and payment method
    getBalance().then(function(r){
        console.log(r);
    });

    //trigger UI updates with new data
    //widget.rerender?
}

async function getBalance(){
    var requestBalance = firebase.functions().httpsCallable("getBalance");
    var response = await requestBalance();
    var accounts = JSON.parse(response.data);
    return accounts;
}

function logout(){
    firebase.auth().signOut().then(function(){
        window.location.href = "/";
    });
}