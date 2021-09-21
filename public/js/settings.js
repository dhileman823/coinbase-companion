var SettingsWidgetFactory = {
    newSettingsWidget: function(){
        var spinner = "<span class='spinner-border spinner-border-sm'></span>";
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
            "keySectionDisplay": "none",
            "addKeyButtonDisplay": "none",
            "keyDisplay": "none",
            "balanceDisplay": "none",
            "paymentMethodDisplay": "none",
            "email": spinner,
            "apiKey": spinner,
            "balance": spinner,
            "paymentMethod": spinner
        };

        settingsWidget.onSignIn = function(){
            $("#signInModal").modal("show");
        };

        settingsWidget.preRender = function(){
            console.log("preRender");
            console.log(_state);
            if(_state.firebaseUser && _state.firebaseUser.email){
                this.props.signInDisplay = "none";
                this.props.contentDisplay = "block";
            }
            if(_state.user){
                this.props.email = _state.firebaseUser.email;
                this.props.keySectionDisplay = "block";
                if(_state.user.key && _state.user.key.length > 0){
                    this.props.keyDisplay = "block";
                    this.props.apiKey = _state.user.key;
                    this.props.balanceDisplay = "block";
                    this.props.paymentMethodDisplay = "block";
                }
                else{
                    this.props.addKeyButtonDisplay = "block";
                }
            }
            if(_state.cbBalance){
                this.props.balance = _state.cbBalance;
            }
            if(_state.cbPaymentMethodName){
                this.props.paymentMethod = _state.cbPaymentMethodName;
            }
        };

        settingsWidget.render = function(){
            var templateString = 
            `<div class="settings-widget" style="margin:10px">
                <div class="section-sign-in" style="display:${this.props.signInDisplay}">
                    <button class="btn btn-primary" attach="onSignIn">Sign In</button>
                </div>
                <div id="settingsSectionContent" style="display:${this.props.contentDisplay}">
                    <h6><span>${this.props.email}</span></h6>
                    <div style="display:${this.props.keySectionDisplay}">
                        API-Key
                        <div style="margin-left:10px">
                            <div style="display:${this.props.addKeyButtonDisplay}"><button class="btn btn-primary">Add Key</button></div>
                            <div style="display:${this.props.keyDisplay}"><span>${this.props.apiKey}</span><button class="btn btn-danger">[RM]</button></div>
                        </div>
                    </div>
                    <div style="display:${this.props.balanceDisplay}">
                        Balance
                        <div style="margin-left:10px">
                            <span>${this.props.balance}</span>
                        </div>
                    </div>
                    <div style="margin-top:10px;display:${this.props.paymentMethodDisplay}">
                        Payment Method
                        <div style="margin-left:10px">
                            <span>${this.props.paymentMethod}</span>
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

        settingsWidget.reload = function(){
            this.preRender();
            this.render();
            this.attachEvents();
        };
        return settingsWidget;
    }
};