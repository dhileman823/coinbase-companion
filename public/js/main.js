var state = {"firebaseUser":null};

function onPageLoad(firebaseUser){
    state.firebaseUser = firebaseUser;

    //create settings widget
    var widget = SettingsWidgetFactory.newSettingsWidget();
    widget.placeAt(this.document.getElementById("panelSettings"));
    //create order widget
}