var SettingsWidgetFactory = {
    newSettingsWidget: function(firebaseUser){
        var domNode = document.createElement("div");
        var settingsWidget = {
            "firebaseUser":firebaseUser,
            "domNode":domNode, 
            "props":{},
            "placeAt":null, 
            "render":null,
            "onSignIn":null
        };

        settingsWidget.props = {
            "settingsSectionSignInDisplay": "block",
            "settingsSectionContentDisplay": "none"
        };

        settingsWidget.onSignIn = function(){
            console.log("in onSignIn");
        };

        settingsWidget.render = function(){
            if(firebaseUser && firebaseUser.email){
                this.props.settingsSectionSignInDisplay = "none";
                this.props.settingsSectionContentDisplay = "block";
            }
            var templateString = 
            `<div class="settings-widget" style="margin:5px">
                <div class="section-sign-in" style="display:${this.props.settingsSectionSignInDisplay}">
                    <button class="btn btn-primary" attach="onSignIn">Sign In</button
                </div>
                <div id="settingsSectionContent" style="display:${this.props.settingsSectionContentDisplay}">
                    This is the main content
                </div>
            </div>`;
            this.domNode.innerHTML = templateString;
            this.attachEvents();
        };

        settingsWidget.attachEvents = function(){
            var buttons = document.querySelectorAll(".settings-widget button");
            for(var i=0;i<buttons.length;i++){
                var button = buttons[i];
                var attach = button.getAttribute("attach");
                if(attach){
                    console.log(this);
                    button.addEventListener("click", this[attach]);
                }
            }
        };

        settingsWidget.placeAt = function(element){
            element.appendChild(this.domNode);
            this.render();
        };
        return settingsWidget;
    }
};