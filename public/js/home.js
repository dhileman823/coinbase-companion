String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.split(search).join(replacement);
};

function loadUserData(){
    UserManager.getUser(firebaseUser.uid).then(function(userDoc){
        var user = userDoc.data();
        var cbBalance;
        //configure UI elements for user
        if(user.key && user.key.length > 0){
            //found user and key
            var peek = user.key.substring(user.key.length-3,user.key.length);
            while(peek.length<user.key.length){
                peek = "X"+peek;
            }
            document.getElementById("spanKeyPeek").innerHTML = peek;
            document.getElementById("memberContent").style.display = "block";
            document.getElementById("btnAddKey").style.display = "none";
            document.getElementById("keySection").style.display = "block";
            //get balance from coinbase
            if(cbBalance){
                //document.getElementById("spanBalance").innerHTML = "$" + cbBalance;
                //document.getElementById("spanBalance").style.color = "green";
            }
            else{
                document.getElementById("spanBalance").innerHTML = "Unable to connect to Coinbase.";
                document.getElementById("spanBalance").style.color = "red";
            }
        }
        else{
            //found user, but no key
            document.getElementById("btnAddKey").style.display = "block";
            document.getElementById("keySection").style.display = "none";
            document.getElementById("spanBalance").innerHTML = "Unable to connect to Coinbase. Add an API-Key.";
            document.getElementById("spanBalance").style.color = "red";
        }

        //get jobs
        UserManager.getUserJobs(userDoc).then(function(jobDocs){
            document.getElementById("listRecur").innerHTML = "";
            for(var i=0;i<jobDocs.length;i++){
                var jobDoc = jobDocs[i];
                var job = jobDoc.data();
                console.log(job);
                var tooltip = "";
                var status = "inactive";
                if(cbBalance){
                    status = job.active ? "active": "inactive";
                    tooltip = status;
                }
                else{
                    status = job.active ? "warn": "inactive";
                    tooltip = status == "warn"?"Unable to connect to Coinbase":"inactive";
                }
                var html = "<div class='job'><span class='{status}' title='{tooltip}'>&nbsp;</span> Buy {currency}, {amount} every {recur} day(s)</div>";
                html = html.replaceAll("{status}", status);
                html = html.replaceAll("{tooltip}", tooltip);
                html = html.replace("{currency}", job.asset);
                html = html.replace("{amount}", "$"+job.amount);
                html = html.replace("{recur}", job.recurDays);
                document.getElementById("listRecur").innerHTML += html;
            }
        })
        .catch(function(err){
            console.error(err);    
        });
    })
    .catch(function(err){
        console.error(err);
        //no user found
        document.getElementById("btnAddKey").style.display = "block";
    });
}

function addApiKey(){
    var newKey = document.getElementById("txtKey").value;
    UserManager.addUserKey(firebaseUser.uid, newKey).then(function(response){
        $("#addKeyModal").modal("hide");
        loadUserData();
    });
}

function removeApiKey(){
    var affirm = confirm("Are you sure you want to remove your api key?");
    if(affirm){
        UserManager.removeUserKey(firebaseUser.uid).then(function(response){
            loadUserData();
        });
    }
}

function addRecur(){
    var job = {};
    job.asset = document.getElementById("selectAsset").value;
    job.amount = parseFloat(document.getElementById("txtAmount").value);
    job.recurDays = parseInt(document.getElementById("txtRecur").value);
    job.active = document.getElementById("selectActive").value=="active"?true:false;
    job.created = new Date();
    console.log(job);
    if(job.amount < 1){
        alert("The amount must be at least 1");
        return;
    }
    if(job.recurDays < 1){
        alert("The number of days must be at least 1");
        return;
    }
    UserManager.createJob(firebaseUser.uid, job).then(function(response){
        console.log(response);
        $("#addPurchaseModal").modal("hide");
        loadUserData();
    });
}