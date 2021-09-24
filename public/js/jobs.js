var JobsWidgetFactory = {
    newJobsWidget: function(){
        var spinner = "<span class='spinner-border spinner-border-sm'></span>";
        var domNode = document.createElement("div");
        var jobsWidget = {
            "domNode":domNode, 
            "props":{},
            "placeAt":null, 
            "render":null
        };

        jobsWidget.props = {
            "signInDisplay": "block",
            "contentDisplay": "none",
        };

        jobsWidget.onSignIn = function(){
            $("#signInModal").modal("show");
        };

        jobsWidget.preRender = function(){
            if(_state.firebaseUser && _state.firebaseUser.email){
                this.props.signInDisplay = "none";
                this.props.contentDisplay = "block";
            }
            if(_state.cbPaymentMethodId && _state.cbPaymentMethodName){
                var option = document.createElement("option");
                option.innerHTML =  _state.cbPaymentMethodName;
                option.value = _state.cbPaymentMethodId;
                document.getElementById("selectPaymentMethod").innerHTML = "";
                document.getElementById("selectPaymentMethod").appendChild(option);
            }
        };

        jobsWidget.render = function(){
            var templateString = 
            `<div class="jobs-widget" style="margin:10px">
                <div class="section-sign-in" style="display:${this.props.signInDisplay}">
                    <button class="btn btn-primary" attach="onSignIn">Sign In</button>
                </div>
                <div style="display:${this.props.contentDisplay}">
                    <div class="job-section">
                        <h6>Recurring Transactions</h6>
                        <div>None.</div>
                        <div class="job-buttons" style="margin-top:5px">
                            <button class="btn btn-success btn-sm" data-bs-toggle="modal" data-bs-target="#addDepositModal" style="width:49%">Add recurring deposit</button>
                            <button class="btn btn-primary btn-sm" data-bs-toggle="modal" data-bs-target="#addPurchaseModal" style="width:49%;float:right">Add recurring order</button>
                        </div>
                    </div>
                    <div style="margin-top:20px">
                        <h6>Recent Transaction History</h6>
                        <div>None.</div>
                    </div>
                </div>


            </div>`;
            this.domNode.innerHTML = templateString;
        };

        jobsWidget.attachEvents = function(){
            var buttons = document.querySelectorAll(".jobs-widget button");
            for(var i=0;i<buttons.length;i++){
                var button = buttons[i];
                var attach = button.getAttribute("attach");
                if(attach){
                    button.addEventListener("click", this[attach]);
                }
            }
        };

        jobsWidget.placeAt = function(element){
            element.appendChild(this.domNode);
            this.preRender();
            this.render();
            this.attachEvents();
        };

        jobsWidget.reload = function(){
            this.preRender();
            this.render();
            this.attachEvents();
        };

        return jobsWidget;
    }
};