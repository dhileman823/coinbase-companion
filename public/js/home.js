function loadUserData(){
    UserManager.getUser(firebaseUser.uid).then(function(userDoc){
        var user = userDoc.data();
        var cbBalance;
        //configure UI elements for user
        if(user.key && user.key.length > 0){
            //found user and key
            document.getElementById("spanKeyPeek").innerHTML = user.key;
            document.getElementById("memberContent").style.display = "block";
            document.getElementById("btnAddKey").style.display = "none";
            document.getElementById("keySection").style.display = "block";

            var req = firebase.functions().httpsCallable("getBalance");
            req().then(function(response){
                console.log(response);
            });
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
                var tooltip = "";
                var status = "inactive";
                if(cbBalance){
                    status = "active";
                    tooltip = status;
                }
                else{
                    status = "inactive";
                    tooltip = "Unable to connect to Coinbase";
                }
                var html = "<div class='job' onclick='loadViewModal(\"{jobId}\")')'><span class='{status}' title='{tooltip}'>&nbsp;</span> Buy {currency}, {amount} every {recur} day(s)</div>";
                html = html.replace("{jobId}", jobDoc.id);
                html = html.replace("{status}", status);
                html = html.replace("{tooltip}", tooltip);
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
    var newSecret = document.getElementById("txtSecret").value;
    var newPassphrase = document.getElementById("txtPassphrase").value;
    UserManager.addUserKey(firebaseUser.uid, newKey, newSecret, newPassphrase).then(function(response){
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

function loadViewModal(jobId){
    UserManager.getUserJob(firebaseUser.uid, jobId).then(function(jobDoc){
        var job = jobDoc.data();
        console.log(job);
        document.getElementById("viewJobId").value = jobId;
        document.getElementById("spanViewAsset").innerHTML = job.asset;
        document.getElementById("spanViewAmount").innerHTML = job.amount;
        document.getElementById("spanViewRecur").innerHTML = job.recurDays;
        document.getElementById("spanViewCreated").innerHTML = job.created.toDate().toUTCString();
        var next = job.created;
        next.seconds = calculateNextDate(job.created, job.recurDays);
        var nextDate = next.toDate();
        nextDate.setUTCHours(5,0,0,0);
        document.getElementById("spanViewNext").innerHTML = nextDate.toUTCString();

    });
    $("#viewPurchaseModal").modal("show");
}

function calculateNextDate(timestamp, recurDays){
    var currentTime = parseInt(new Date().getTime()/1000);
    var diff = currentTime - timestamp.seconds;
    var diffDays = parseInt(diff / 86400);
    var prevOccur = parseInt(diffDays / recurDays);
    var nextTimestamp = timestamp.seconds += (86400*recurDays*(prevOccur+1));
    return nextTimestamp;
}

function addRecur(){
    var job = {};
    job.asset = document.getElementById("selectAsset").value;
    job.amount = parseFloat(document.getElementById("txtAmount").value);
    job.recurDays = parseInt(document.getElementById("txtRecur").value);
    job.created = new Date();
    if(job.amount < 1){
        alert("The amount must be at least 1");
        return;
    }
    if(job.recurDays < 1){
        alert("The number of days must be at least 1");
        return;
    }
    UserManager.createJob(firebaseUser.uid, job).then(function(response){
        $("#addPurchaseModal").modal("hide");
        loadUserData();
    });
}

function deleteRecur(){
    var affirm = confirm("Are you sure you want to delete this recurring purchase?");
    if(affirm){
        var jobId = document.getElementById("viewJobId").value;
        UserManager.deleteJob(firebaseUser.uid, jobId).then(function(response){
            $("#viewPurchaseModal").modal("hide");
            loadUserData();
        });
    }
}