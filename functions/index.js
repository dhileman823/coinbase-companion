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
        if(userHasValidKey(user)){
            functions.logger.log("getBalance => user has valid key");
            return coinbaseBalanceRequest(user);
        }
        else{
            return {"message":"User does not have a valid key"};
        }
    });
});

exports.getPaymentMethods = functions.https.onCall((data, context) => {
    const uid = context.auth.uid;
    let userCollection = db.collection("users");
    return userCollection.doc(uid).get().then(userDoc => {
        var user = userDoc.data();
        functions.logger.log("getPaymentMethods => got user");
        if(userHasValidKey(user)){
            functions.logger.log("getPaymentMethods => user has valid key");
            return coinbasePaymentMethodsRequest(user);
        }
        else{
            return {"message":"User does not have a valid key"};
        }
    });
});

function userHasValidKey(user){
    if(user && user.key && user.key.length>0 && user.secret && user.secret.length>0 && user.passphrase && user.passphrase.length>0){
        return true;
    }
    return false;
}

function coinbaseBalanceRequest(user){
    functions.logger.log("getBalance => begin coinbaseBalanceRequest");
    const coinbaseApiUrl = "https://api.pro.coinbase.com";
    const accountsUrl = coinbaseApiUrl + "/accounts";

    var timestamp = Date.now() / 1000;
    var signature = getRequestSignature(user, "/accounts", timestamp);
    var requestOptions = {
        "url": accountsUrl,
        "headers": {
            "CB-ACCESS-KEY": user.key,
            "CB-ACCESS-SIGN": signature,
            "CB-ACCESS-TIMESTAMP": timestamp,
            "CB-ACCESS-PASSPHRASE": user.passphrase,
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

function coinbasePaymentMethodsRequest(user){
    functions.logger.log("getPaymentMethods => begin coinbasePaymentMethodsRequest");
    const coinbaseApiUrl = "https://api.pro.coinbase.com";
    const pmUrl = coinbaseApiUrl + "/payment-methods";

    var timestamp = Date.now() / 1000;
    var signature = getRequestSignature(user, "/payment-methods", timestamp);
    var requestOptions = {
        "url": pmUrl,
        "headers": {
            "CB-ACCESS-KEY": user.key,
            "CB-ACCESS-SIGN": signature,
            "CB-ACCESS-TIMESTAMP": timestamp,
            "CB-ACCESS-PASSPHRASE": user.passphrase,
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

function getRequestSignature(user, path, timestamp){
    var crypto = require('crypto');
    var secret = user.secret;
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

exports.processJobs = functions.pubsub.schedule('every day 12:00').timeZone('Etc/UTC').onRun(async context => {
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
    user.jobs = [];
    let jobDocs = await userDoc.ref.collection("jobs").get();
    jobDocs.forEach(jobDoc => {
        let job = jobDoc.data();
        functions.logger.log("processJobs => got job", job);
        user.jobs.push(job);
    });
    processUserOrders(user);
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
            }
        }
        else{
            functions.logger.log('Cannot process jobs for user ' + user.email + ": missing api-key.");
        }
    }
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