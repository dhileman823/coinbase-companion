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
        functions.logger.log("getBalance => got user", user);
        if(userHasValidKey(user)){
            functions.logger.log("getBalance => user has valid key");
            coinbaseBalanceRequest(user).then(function(resp){
                functions.logger.log("getBalance => conbaseBalanceRequest.then");
                return resp;
            });
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
    var signature = getCoinbaseBalanceRequestSignature(user, timestamp);
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

function getCoinbaseBalanceRequestSignature(user, timestamp){
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

exports.processJobs = functions.pubsub.schedule('every day 00:00').onRun(async context => {
    let userCollection = db.collection("users");
    userCollection.get().then(snapshot =>{
        snapshot.forEach(userDoc => {
            let user = userDoc.data();
            userDoc.ref.collection("jobs").get().then(snapshot2 =>{
                user.jobs = [];
                snapshot2.forEach(jobDoc => {
                    user.jobs.push(jobDoc.data());
                });
                processUserOrders(user);
            });
        });
    });
});

function processUserOrders(user){
    if(user.jobs.length > 0){
        if(user.key){
            for(let i=0; i<user.jobs.length; i++){
                let job = user.jobs[i];
                functions.logger.log("Process job " + job.asset + ", " + job.amount + " for user " + user.email);    
            }
        }
        else{
            functions.logger.log('Cannot process jobs for user ' + user.email + ": missing api-key.");
        }
    }
}