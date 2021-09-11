var UserManager = {

    createUser: function(firebaseUser){
        var userData = {"email":firebaseUser.email, "key":"", "secret":"", "passphrase":""};
        var collection = firebase.firestore().collection("users");
        return collection.doc(firebaseUser.uid).set(userData).then(function(){
            return "User created!";
        });
    },

    getUser: function(userId){
        var collection = firebase.firestore().collection("users");
        return collection.doc(userId).get().then(function(docRef){
            return docRef;
        });
    },

    getUserJobs: function(userDoc){
        return userDoc.ref.collection("jobs").get().then(function(querySnapshot){
            let jobDocs = [];
            querySnapshot.forEach(function(doc){
                jobDocs.push(doc);
            });
            return jobDocs;
        });
    },

    getUserJob: function(userId, jobId){
        var collection = firebase.firestore().collection("users/"+userId+"/jobs");
        return collection.doc(jobId).get().then(function(docRef){
            return docRef;
        });
    },

    addUserKey: function(userId, key, secret, passphrase){
        var collection = firebase.firestore().collection("users");
        return collection.doc(userId).update({"key":key, "secret":secret, "passphrase":passphrase}).then(function(){
            return "User key added!";
        });
    },

    removeUserKey: function(userId){
        var collection = firebase.firestore().collection("users");
        return collection.doc(userId).update({"key":"", "secret":"", "passphrase":""}).then(function(){
            return "User key removed!";
        });
    },

    createJob: function(userId, job){
        var collection = firebase.firestore().collection("users/"+userId+"/jobs");
        return collection.add(job).then(function(doc){
            return doc.id;
        });
    },
    
    deleteJob: function(userId, jobId){
        collection = firebase.firestore().collection("users/"+userId+"/jobs");
        return collection.doc(jobId).delete().then(function(){
            return "document deleted";
        });
    }
}