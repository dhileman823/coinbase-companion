var SettingsWidgetFactory = {
    newSettingsWidget: function(){
        var domNode = document.createElement("div");
        var settingsWidget = {
            "domNode":domNode, 
            "props":{},
            "placeAt":null, 
            "render":null,
            "onSignIn":null
        };

        settingsWidget.props = {
            "signInDisplay": "block",
            "contentDisplay": "none",
            "addKeyDisplay": "none",
            "keyDisplay": "none",
            "balanceDisplay": "none",
            "paymentMethodDisplay": "none"
        };

        settingsWidget.onSignIn = function(){
            $("#signInModal").modal("show");
        };

        settingsWidget.preRender = function(){
            if(_state.firebaseUser && _state.firebaseUser.email){
                this.props.signInDisplay = "none";
                this.props.contentDisplay = "block";
            }
        };

        settingsWidget.render = function(){
            var templateString = 
            `<div class="settings-widget" style="margin:10px">
                <div class="section-sign-in" style="display:${this.props.signInDisplay}">
                    <button class="btn btn-primary" attach="onSignIn">Sign In</button>
                </div>
                <div id="settingsSectionContent" style="display:${this.props.contentDisplay}">
                    <h6><span></span><span class="spinner-border spinner-border-sm"></span></h6>
                    <div>
                        API-Key
                        <div style="margin-left:10px">
                            <div style="display:${this.props.addKeyDisplay}"><button class="btn btn-primary">Add Key</button></div>
                            <div style="display:${this.props.keyDisplay}"><span><span class="spinner-border spinner-border-sm"></span></span><button class="btn btn-danger">[RM]</button></div>
                        </div>
                    </div>
                    <div style="display:${this.props.balanceDisplay}">
                        Balance
                        <div style="margin-left:10px">
                            <span><span class="spinner-border spinner-border-sm"></span></span>
                        </div>
                    </div>
                    <div style="display:${this.props.paymentMethodDisplay}">
                        Payment Method
                        <div style="margin-left:10px">
                            <span><span class="spinner-border spinner-border-sm"></span></span>
                        </div>
                    </div>
                </div>
            </div>`;
            this.domNode.innerHTML = templateString;
        };

        settingsWidget.attachEvents = function(){
            var buttons = document.querySelectorAll(".settings-widget button");
            for(var i=0;i<buttons.length;i++){
                var button = buttons[i];
                var attach = button.getAttribute("attach");
                if(attach){
                    button.addEventListener("click", this[attach]);
                }
            }
        };

        settingsWidget.placeAt = function(element){
            element.appendChild(this.domNode);
            this.preRender();
            this.render();
            this.attachEvents();
        };
        return settingsWidget;
    }
};