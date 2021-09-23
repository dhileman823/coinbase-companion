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
            if(_state.firebaseUser && _state.firebaseUser.email){
                this.props.signInDisplay = "none";
                this.props.contentDisplay = "block";
            }
            if(_state.user){
                this.props.email = _state.firebaseUser.email;
                this.props.keySectionDisplay = "block";
                if(_state.user.key && _state.user.key.length > 0){
                    this.props.addKeyButtonDisplay = "none";
                    this.props.keyDisplay = "block";
                    this.props.apiKey = _state.user.key;
                    this.props.balanceDisplay = "block";
                    this.props.paymentMethodDisplay = "block";
                }
                else{
                    this.props.addKeyButtonDisplay = "block";
                    this.props.keyDisplay = "none";
                    this.props.balanceDisplay = "none";
                    this.props.paymentMethodDisplay = "none";
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
                    <div style="margin-top:20px;display:${this.props.keySectionDisplay}">
                        <h6>Coinbase Pro API-Key</h6>
                        <div style="margin-left:10px">
                            <div style="display:${this.props.addKeyButtonDisplay}"><button class="btn btn-primary btn-sm" data-bs-toggle="modal" data-bs-target="#addKeyModal">Add Key</button></div>
                            <div style="display:${this.props.keyDisplay}"><span style="font-style:italic">${this.props.apiKey}</span> <button class="btn btn-danger btn-sm" attach="handleRemoveKeyClick"><i class='bi-trash-fill'></i></button></div>
                        </div>
                    </div>
                    <div style="margin-top:10px;display:${this.props.balanceDisplay}">
                        <h6>Available Balance</h6>
                        <div style="margin-left:10px">
                            <span style="font-style:italic">${this.props.balance}</span>
                        </div>
                    </div>
                    <div style="margin-top:10px;display:${this.props.paymentMethodDisplay}">
                    <h6>Payment Method</h6>
                        <div style="margin-left:10px">
                            <span style="font-style:italic">${this.props.paymentMethod}</span>
                        </div>
                    </div>
                </div>

                <div class="modal fade" id="addKeyModal" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
                    <div class="modal-dialog">
                        <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="exampleModalLabel">Add API-Key</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            <input id="txtKey" type="text" class="form-control" placeholder="Key"/>
                            <input id="txtPassphrase" type="text" class="form-control" placeholder="Passphrase"/>
                            <input id="txtSecret" type="password" class="form-control" placeholder="Secret"/>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                            <button type="button" class="btn btn-primary" attach="handleAddKeyClick">Save</button>
                        </div>
                        </div>
                    </div>
                </div>
            </div>`;
            this.domNode.innerHTML = templateString;
        };

        settingsWidget.handleAddKeyClick = function(){
            var newKey = document.getElementById("txtKey").value;
            var newSecret = document.getElementById("txtSecret").value;
            var newPassphrase = document.getElementById("txtPassphrase").value;
            UserManager.addUserKey(_state.firebaseUser.uid, newKey, newSecret, newPassphrase).then(function(response){
                $("#addKeyModal").modal("hide");
                _state.user.key = response;
                loadCoinbaseData();
            });
        };

        settingsWidget.handleRemoveKeyClick = function(){
            var affirm = confirm("Are you sure you want to remove your api key?");
            if(affirm){
                UserManager.removeUserKey(_state.firebaseUser.uid, _state.user.key).then(function(response){
                    if(response == UserManager.RESPONSE_KEY_REMOVED){
                        _state.user.key = "";
                        _state.widgets.settingsWidget.reload();
                    }
                });
            }
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