var request = require('request');
const functions = require("firebase-functions");
var admin = require('firebase-admin');
admin.initializeApp();
var db = admin.firestore();

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
                return coinbaseBalanceRequest(safe);
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
                return coinbasePaymentMethodsRequest(safe);
            }
            else{
                return {"data":"{\"message\":\"User does not have a valid key\"}"};
            }
        });
    });
});

function userHasValidKey(safe){
    if(safe && safe.key && safe.key.length>0 && safe.secret && safe.secret.length>0 && safe.passphrase && safe.passphrase.length>0){
        return true;
    }
    return false;
}

function coinbaseBalanceRequest(safe){
    functions.logger.log("getBalance => begin coinbaseBalanceRequest");
    const coinbaseApiUrl = "https://api.pro.coinbase.com";
    const accountsUrl = coinbaseApiUrl + "/accounts";

    var timestamp = Date.now() / 1000;
    var signature = getRequestSignature(safe, "/accounts", timestamp);
    var requestOptions = {
        "url": accountsUrl,
        "headers": {
            "CB-ACCESS-KEY": safe.key,
            "CB-ACCESS-SIGN": signature,
            "CB-ACCESS-TIMESTAMP": timestamp,
            "CB-ACCESS-PASSPHRASE": safe.passphrase,
            "User-Agent": "Firebase-function"
        }
    };
    return new Promise(function(resolve, reject){
        functions.logger.log("getBalance => begin request to coinbase: " + accountsUrl);
        request(requestOptions, function(error, response, body) {
            functions.logger.log("getBalance => coinbase request finished", body);
            resolve(body);
        });
    });
}

function coinbasePaymentMethodsRequest(safe){
    functions.logger.log("getPaymentMethods => begin coinbasePaymentMethodsRequest");
    const coinbaseApiUrl = "https://api.pro.coinbase.com";
    const pmUrl = coinbaseApiUrl + "/payment-methods";

    var timestamp = Date.now() / 1000;
    var signature = getRequestSignature(safe, "/payment-methods", timestamp);
    var requestOptions = {
        "url": pmUrl,
        "headers": {
            "CB-ACCESS-KEY": safe.key,
            "CB-ACCESS-SIGN": signature,
            "CB-ACCESS-TIMESTAMP": timestamp,
            "CB-ACCESS-PASSPHRASE": safe.passphrase,
            "User-Agent": "Firebase-function"
        }
    };
    return new Promise(function(resolve, reject){
        functions.logger.log("getPaymentMethods => begin request to coinbase: " + pmUrl);
        request(requestOptions, function(error, response, body) {
            functions.logger.log("getPaymentMethods => coinbase request finished", body);
            resolve(body);
        });
    });
}

function getRequestSignature(safe, path, timestamp){
    var crypto = require('crypto');
    var secret = safe.secret;
    var requestPath = path;
    var body = ""; //no body for this GET request
    var method = 'GET';
    // create the prehash string by concatenating required parts
    var what = timestamp + method + requestPath + body;
    // decode the base64 secret
    var key = Buffer(secret, 'base64');
    // create a sha256 hmac with the secret
    var hmac = crypto.createHmac('sha256', key);
    // sign the require message with the hmac
    // and finally base64 encode the result
    return hmac.update(what).digest('base64');
}

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

async function processUserJobs(userDoc){
    let user = userDoc.data();
    user.id = userDoc.id;
    user.jobs = [];
    let jobDocs = await userDoc.ref.collection("jobs").get();
    jobDocs.forEach(jobDoc => {
        let job = jobDoc.data();
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

                    //enter a transaction record
                    functions.logger.log("Process job - adding transaction history");
                    let txCollection = db.collection("users/"+user.id+"/transactions");
                    let tx = {"type":job.type, "asset":job.asset, "amount":job.amount, "created": now};
                    txCollection.add(tx);

                    //update the next purchase date
                    let newNextPurchaseDate = getNewNextPurchaseDate(job);
                    functions.logger.log("Process job - NEW nextDate: " + newNextPurchaseDate.toUTCString());
                }
            }
        }
        else{
            functions.logger.log('Cannot process jobs for user ' + user.email + ": missing api-key.");
        }
    }
}

function getNewNextPurchaseDate(job){
    var date = job.nextPurchaseDate.toDate();
    var days = job.recurDays;
    var result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
}

function getCoinbasePlaceOrderSignature(user, job, timestamp){
    var crypto = require('crypto');
    var secret = user.secret;
    var requestPath = '/accounts';
    var body = ""; //no body for this GET request
    var method = 'GET';
    // create the prehash string by concatenating required parts
    var what = timestamp + method + requestPath + body;
    // decode the base64 secret
    var key = Buffer(secret, 'base64');
    // create a sha256 hmac with the secret
    var hmac = crypto.createHmac('sha256', key);
    // sign the require message with the hmac
    // and finally base64 encode the result
    return hmac.update(what).digest('base64');
}