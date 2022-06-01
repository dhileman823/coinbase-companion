var request = require('request');
const functions = require("firebase-functions");
var admin = require('firebase-admin');
admin.initializeApp();
var db = admin.firestore();
var coinbase = require('./coinbase');

exports.getBalance = functions.https.onCall((data, context) => {
    const uid = context.auth.uid;
    let userCollection = db.collection("users");
    return userCollection.doc(uid).get().then(userDoc => {
        var user = userDoc.data();
        functions.logger.log("getBalance => got user");
        let safeCollection = db.collection("users/"+uid+"/safe")
        return safeCollection.doc(user.key).get().then(safeDoc => {
            var safe = safeDoc.data();
            if(userHasValidKey(safe)){
                functions.logger.log("getBalance => user has valid key");
                coinbase.api.keys = safe;
                return coinbase.api.getAccounts();
            }
            else{
                return {"data":"{\"message\":\"User does not have a valid key\"}"};
            }
        });
    });
});

exports.getPaymentMethods = functions.https.onCall((data, context) => {
    const uid = context.auth.uid;
    let userCollection = db.collection("users");
    return userCollection.doc(uid).get().then(userDoc => {
        var user = userDoc.data();
        functions.logger.log("getPaymentMethods => got user");
        let safeCollection = db.collection("users/"+uid+"/safe")
        return safeCollection.doc(user.key).get().then(safeDoc => {
            var safe = safeDoc.data();
            if(userHasValidKey(safe)){
                functions.logger.log("getPaymentMethods => user has valid key");
                coinbase.api.keys = safe;
                return coinbase.api.getPaymentMethods();
            }
            else{
                return {"data":"{\"message\":\"User does not have a valid key\"}"};
            }
        });
    });
});

exports.doDeposit = functions.https.onCall((data, context) => {
    functions.logger.log("doDeposit => data " + data);
    const uid = context.auth.uid;
    let userCollection = db.collection("users");
    return userCollection.doc(uid).get().then(userDoc => {
        var user = userDoc.data();
        functions.logger.log("doDeposit => got user");
        let safeCollection = db.collection("users/"+uid+"/safe")
        return safeCollection.doc(user.key).get().then(safeDoc => {
            var safe = safeDoc.data();
            if(userHasValidKey(safe)){
                functions.logger.log("doDeposit => user has valid key");
                coinbase.api.keys = safe;
                return coinbase.api.deposit(data.amount, data.paymentMethodId);
            }
            else{
                return {"data":"{\"message\":\"User does not have a valid key\"}"};
            }
        });
    });
});

exports.doOrder = functions.https.onCall((data, context) => {
    functions.logger.log("doOrder => data " + data);
    const uid = context.auth.uid;
    let userCollection = db.collection("users");
    return userCollection.doc(uid).get().then(userDoc => {
        var user = userDoc.data();
        functions.logger.log("doOrder => got user");
        let safeCollection = db.collection("users/"+uid+"/safe")
        return safeCollection.doc(user.key).get().then(safeDoc => {
            var safe = safeDoc.data();
            if(userHasValidKey(safe)){
                functions.logger.log("doOrder => user has valid key");
                coinbase.api.keys = safe;
                return coinbase.api.order(data.product, data.amount);
            }
            else{
                return {"data":"{\"message\":\"User does not have a valid key\"}"};
            }
        });
    });
});

exports.processJobs = functions.pubsub.schedule('every day 12:01').timeZone('Etc/UTC').onRun(async context => {
    functions.logger.log("processJobs => begin");
    let userCollection = db.collection("users");
    functions.logger.log("processJobs => get users...");
    const snapshot = await userCollection.get();
    functions.logger.log("processJobs => got snapshot");
    let promises = [];
    snapshot.forEach(userDoc => {
        let user = userDoc.data();
        functions.logger.log("processJobs => got user: " + user.email);
        let promise = processUserJobs(userDoc);
        promises.push(promise);
    });
    return Promise.all(promises);
});

function userHasValidKey(safe){
    if(safe && safe.key && safe.key.length>0 && safe.secret && safe.secret.length>0 && safe.passphrase && safe.passphrase.length>0){
        return true;
    }
    return false;
}

async function processUserJobs(userDoc){
    let user = userDoc.data();
    user.id = userDoc.id;
    user.jobs = [];
    let jobDocs = await userDoc.ref.collection("jobs").get();
    jobDocs.forEach(jobDoc => {
        let job = jobDoc.data();
        job.id = jobDoc.id;
        functions.logger.log("processJobs => got job", job);
        user.jobs.push(job);
    });
    functions.logger.log("processUserJobs => user.id " + user.id);
    functions.logger.log("processUserJobs => user.key " + user.key);
    if(user.key && user.key.length > 0){
        let safeCollection = db.collection("users/"+user.id+"/safe")
        let safeDoc = await safeCollection.doc(user.key).get();
        let safe = safeDoc.data();
        if(userHasValidKey(safe)){
            functions.logger.log("User has valid key; continue processing user orders");
            user.safe = safe;
            processUserOrders(user);
        }
        else{
            functions.logger.log("User does not have valid key.");
        }
    }
    else{
        functions.logger.log("User does not have a key.");
    }
}

function processUserOrders(user){
    if(user.jobs.length > 0){
        if(user.key){
            for(let i=0; i<user.jobs.length; i++){
                let job = user.jobs[i];
                functions.logger.log("Process job " + job.asset + ", " + job.amount + " for user " + user.email, job.created);
                var next = job.nextPurchaseDate.toDate();
                var now = new Date();
                functions.logger.log("Process job - nextDate: " + next.toUTCString());
                functions.logger.log("Process job - nowDate: " + now.toUTCString());
                functions.logger.log("now " + now.getTime() + " >< next " + next.getTime());
                var timeForPurchase = now >= next;
                functions.logger.log("timeForPurchase? " + timeForPurchase);
                if(timeForPurchase){
                    //submit the order
                    if(job.type == "deposit"){
                        //do deposit
                        functions.logger.log("Process job - do coinbase deposit");
                        coinbase.api.keys = user.safe;
                        coinbase.api.deposit(job.amount, job.paymentMethod);

                        //enter a transaction record
                        addHistory(user, job, now);
                        //update the next purchase date
                        updateNextPurchaseDate(user, job);
                    }
                    else{
                        //do order
                        functions.logger.log("Process job - do coinbase order");
                        coinbase.api.keys = user.safe;
                        coinbase.api.order(job.asset, job.amount);

                        //enter a transaction record
                        addHistory(user, job, now);
                        //update the next purchase date
                        updateNextPurchaseDate(user, job);
                    }

                    
                }
            }
        }
        else{
            functions.logger.log('Cannot process jobs for user ' + user.email + ": missing api-key.");
        }
    }
}

function addHistory(user, job, now){
    functions.logger.log("Process job - adding transaction history");
    let txCollection = db.collection("users/"+user.id+"/transactions");
    let tx = {"type":job.type, "asset":job.asset, "amount":job.amount, "created": now};
    txCollection.add(tx);
}

function updateNextPurchaseDate(user, job){
    let newNextPurchaseDate = getNewNextPurchaseDate(job);
    functions.logger.log("Process job - NEW nextDate: " + newNextPurchaseDate.toUTCString());
    let jobCollection = db.collection("users/"+user.id+"/jobs");
    jobCollection.doc(job.id).update({"nextPurchaseDate": newNextPurchaseDate});
}

function getNewNextPurchaseDate(job){
    var date = job.nextPurchaseDate.toDate();
    var days = job.recurDays;
    var result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
}