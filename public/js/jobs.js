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
            "jobs": [],
            "transactions": []
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
            if(_state.jobs && _state.jobs.length > 0){
                this.props.jobs = _state.jobs;
            }
            if(_state.transactions && _state.transactions.length > 0){
                this.props.transactions = _state.transactions;
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
                        <div id="jobsDiv"></div>
                        <div class="job-buttons" style="margin-top:5px">
                            <button class="btn btn-success btn-sm" data-bs-toggle="modal" data-bs-target="#addDepositModal" style="width:49%">Add recurring deposit</button>
                            <button class="btn btn-primary btn-sm" data-bs-toggle="modal" data-bs-target="#addPurchaseModal" style="width:49%;float:right">Add recurring order</button>
                        </div>
                    </div>
                    <div style="margin-top:20px">
                        <h6>Recent Transaction History</h6>
                        <div id="txDiv"></div>
                    </div>
                </div>
            </div>`;
            this.domNode.innerHTML = templateString;
        };

        jobsWidget.postCreate = function(){
            var jobsDiv = document.querySelector("#jobsDiv");
            if(this.props.jobs.length > 0)
                jobsDiv.innerHTML = "";
            else
                jobsDiv.innerHTML = "None.";
            for(var i=0; i<this.props.jobs.length; i++){
                var job = this.props.jobs[i];
                var tooltip = "";
                var status = "inactive-job";
                var jobClass = "job";
                var action = "";
                var onClick = "";
                if(job.type == "deposit"){
                    action = "Depositing";
                    jobClass += " job-deposit";
                    onClick = "loadDepositViewModal";
                }
                else{
                    action = "Buying";
                    jobClass += " job-order";
                    onClick = "loadViewModal";
                }
                if(job.type == "deposit"){
                    if(_state.cbPaymentMethodId && _state.cbPaymentMethodId.length > 0){
                        status = "active-job";
                        tooltip = status;
                    }
                    else {
                        status = "inactive-job";
                        tooltip = "No available payment methods.";
                    }
                }
                else{
                    if(_state.cbBalance && _state.cbBalance > job.amount){
                        status = "active-job";
                        tooltip = status;
                    }
                    else{
                        status = "inactive-job";
                        tooltip = "Insufficent funds.";
                    }
                }
                var html = "<div class='{jobClass}' title='{tooltip}' onclick='{onClick}(\"{jobId}\")')'><span class='{status}'>&nbsp;</span> {action} {amount} {currency},  {nextPurchaseDate} <i class='bi-three-dots-vertical' style='float:right'></i></div>";
                html = html.replace("{jobClass}", jobClass);
                html = html.replace("{jobId}", job.id);
                html = html.replace("{onClick}", onClick);
                html = html.replace("{action}", action);
                html = html.replace("{status}", status);
                html = html.replace("{tooltip}", tooltip);
                html = html.replace("{currency}", job.asset);
                html = html.replace("{amount}", "$"+job.amount);
                html = html.replace("{nextPurchaseDate}", job.nextPurchaseDate.toDate().toLocaleDateString());
                jobsDiv.innerHTML += html;
            }

            var txDiv = document.querySelector("#txDiv");
            txDiv.innerHTML = "None.";
            if(this.props.transactions.length > 0){
                var table = "<table class='table'><thead><tr><th>Type</th><th>Asset</th><th>$Amount</th><th>Date</th></tr></thead><tbody>";
                for(var i=0; i<this.props.transactions.length; i++){
                    var tx = this.props.transactions[i];
                    var html = "<tr><td>"+tx.type+"</td><td>"+tx.asset+"</td><td>"+tx.amount+"</td><td>"+tx.created.toDate().toLocaleDateString()+"</td></tr>";
                    table += html;
                }
                table += "</tbody></table>";
                txDiv.innerHTML = table;
            }
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
            this.postCreate();
        };

        jobsWidget.reload = function(){
            this.preRender();
            this.render();
            this.attachEvents();
            this.postCreate();
        };

        return jobsWidget;
    }
};