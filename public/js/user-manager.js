var UserManager = {
    RESPONSE_USER_CREATED: "User created!",
    RESPONSE_KEY_REMOVED: "User key removed!",
    RESPONSE_JOB_DELETED: "Job deleted!",

    createUser: function(firebaseUser){
        var self = this;
        var userData = {"email":firebaseUser.email, "key":""};
        var collection = firebase.firestore().collection("users");
        return collection.doc(firebaseUser.uid).set(userData).then(function(){
            return self.RESPONSE_USER_CREATED;
        });
    },

    getUser: function(userId){
        var collection = firebase.firestore().collection("users");
        return collection.doc(userId).get().then(function(docRef){
            return docRef;
        });
    },

    getUserJobs: function(userDoc){
        return userDoc.ref.collection("jobs").orderBy("nextPurchaseDate").get().then(function(querySnapshot){
            let jobs = [];
            querySnapshot.forEach(function(doc){
                let job = doc.data();
                job.id = doc.id;
                jobs.push(job);
            });
            return jobs;
        });
    },

    getUserTransactions: function(userDoc){
        return userDoc.ref.collection("transactions").orderBy("created", "desc").get().then(function(querySnapshot){
            let txs = [];
            querySnapshot.forEach(function(doc){
                let tx = doc.data();
                tx.id = doc.id;
                txs.push(tx);
            });
            return txs;
        });
    },

    getUserJob: function(userId, jobId){
        var collection = firebase.firestore().collection("users/"+userId+"/jobs");
        return collection.doc(jobId).get().then(function(docRef){
            return docRef;
        });
    },

    addUserKey: function(userId, key, secret, passphrase){
        var collection = firebase.firestore().collection("users/"+userId+"/safe");
        var safeData = {"key":key, "passphrase":passphrase, "secret":secret};
        return collection.add(safeData).then(function(safeDoc){
            var collection2 = firebase.firestore().collection("users");
            return collection2.doc(userId).update({"key":safeDoc.id}).then(function(){
                return safeDoc.id;
            });
        });
    },

    removeUserKey: function(userId, safeId){
        var self = this;
        var collection = firebase.firestore().collection("users");
        return collection.doc(userId).update({"key":""}).then(function(){
            var collection2 = firebase.firestore().collection("users/"+userId+"/safe");
            return collection2.doc(safeId).delete().then(function(){
                return self.RESPONSE_KEY_REMOVED;
            });
        });
    },

    createJob: function(userId, job){
        var collection = firebase.firestore().collection("users/"+userId+"/jobs");
        return collection.add(job).then(function(doc){
            return doc.id;
        });
    },
    
    deleteJob: function(userId, jobId){
        var self = this;
        collection = firebase.firestore().collection("users/"+userId+"/jobs");
        return collection.doc(jobId).delete().then(function(){
            return self.RESPONSE_JOB_DELETED;
        });
    }
}