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
            
        };

        jobsWidget.preRender = function(){

        };

        jobsWidget.render = function(){
            var templateString = 
            `<div class="jobs-widget" style="margin:10px">
                <div class="job-section">
                    <h6>Recurring Transactions</h6>
                    <div>None.</div>
                    <div class="job-buttons" style="margin-top:5px">
                        <button class="btn btn-success btn-sm" data-bs-toggle="modal" data-bs-target="#addDepositModal" style="width:49%">Add recurring deposit</button>
                        <button class="btn btn-primary btn-sm" data-bs-toggle="modal" data-bs-target="#addPurchaseModal" style="width:49%;float:right">Add recurring order</button>
                    </div>
                    <button onclick="goToSettings()">go to settings</button>
                </div>
                <div style="margin-top:20px">
                    <h6>Recent Transaction History</h6>
                    <div>None.</div>
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