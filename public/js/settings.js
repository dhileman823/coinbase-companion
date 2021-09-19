var SettingsWidgetFactory = {
    newSettingsWidget: function(firebaseUser){
        var domNode = document.createElement("div");
        var settingsWidget = {
            "firebaseUser":firebaseUser,
            "domNode":domNode, 
            "props":{},
            "placeAt":null, 
            "render":null
        };

        settingsWidget.props = {
            "settingsSectionSignInDisplay": "block",
            "settingsSectionContentDisplay": "none"
        };

        settingsWidget.render = function(){
            if(firebaseUser && firebaseUser.email){
                this.props.settingsSectionSignInDisplay = "none";
                this.props.settingsSectionContentDisplay = "block";
            }
            var templateString = 
            `<div style="margin:5px">
                <div class="section-sign-in" style="display:${this.props.settingsSectionSignInDisplay}">
                    <button class="btn btn-primary">Sign In</button
                </div>
                <div id="settingsSectionContent" style="display:${this.props.settingsSectionContentDisplay}">
                    This is the main content
                </div>
            </div>`;
            this.domNode.innerHTML = templateString;
        };
        settingsWidget.placeAt = function(element){
            element.appendChild(this.domNode);
            this.render();
        };
        return settingsWidget;
    }
};