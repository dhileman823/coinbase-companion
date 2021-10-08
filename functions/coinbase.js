var request = require('request');
const functions = require("firebase-functions");

var api = {
    "keys": {},
    "baseUrl": "https://api.pro.coinbase.com",
    "accountsUrl": "/accounts",
    "paymentMethodsUrl": "/payment-methods",

    "getRequestSignature": function(path, timestamp, body, method){
        var crypto = require('crypto');
        var secret = this.keys.secret;
        var requestPath = path;
        // create the prehash string by concatenating required parts
        var what = timestamp + method + requestPath + body;
        // decode the base64 secret
        var key = Buffer(secret, 'base64');
        // create a sha256 hmac with the secret
        var hmac = crypto.createHmac('sha256', key);
        // sign the require message with the hmac
        // and finally base64 encode the result
        return hmac.update(what).digest('base64');
    },

    "getAccounts": function(){
        functions.logger.log("api.getAccounts => begin");
        var timestamp = Date.now() / 1000;
        var body = ""; //no body for GET request
        var signature = this.getRequestSignature(this.accountsUrl, timestamp, body, "GET");
        var requestOptions = {
            "url": this.baseUrl + this.accountsUrl,
            "headers": {
                "CB-ACCESS-KEY": this.keys.key,
                "CB-ACCESS-SIGN": signature,
                "CB-ACCESS-TIMESTAMP": timestamp,
                "CB-ACCESS-PASSPHRASE": this.keys.passphrase,
                "User-Agent": "Firebase-function"
            }
        };
        return new Promise(function(resolve, reject){
            functions.logger.log("api.getAccounts => begin request to coinbase");
            request(requestOptions, function(error, response, body) {
                functions.logger.log("api.getAccounts => coinbase request finished", body);
                resolve(body);
            });
        });
    },

    "getPaymentMethods": function(){
        functions.logger.log("api.getPaymentMethods => begin");
        var timestamp = Date.now() / 1000;
        var body = ""; //no body for GET request
        var signature = this.getRequestSignature(this.paymentMethodsUrl, timestamp, body, "GET");
        var requestOptions = {
            "url": this.baseUrl + this.paymentMethodsUrl,
            "headers": {
                "CB-ACCESS-KEY": this.keys.key,
                "CB-ACCESS-SIGN": signature,
                "CB-ACCESS-TIMESTAMP": timestamp,
                "CB-ACCESS-PASSPHRASE": this.keys.passphrase,
                "User-Agent": "Firebase-function"
            }
        };
        return new Promise(function(resolve, reject){
            functions.logger.log("api.getPaymentMethods => begin request to coinbase");
            request(requestOptions, function(error, response, body) {
                functions.logger.log("api.getPaymentMethods => coinbase request finished", body);
                resolve(body);
            });
        });
    },

    "deposit": function(amount, paymentMethodId){

    },

    "order": function(asset, amount){

    }
};

module.exports = { api };