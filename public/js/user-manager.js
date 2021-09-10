var UserManager = {

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

    addUserKey: function(userId, key){
        var collection = firebase.firestore().collection("users");
        return collection.doc(userId).update({"key":key}).then(function(){
            return "User key added!";
        });
    },

    removeUserKey: function(userId){
        var collection = firebase.firestore().collection("users");
        return collection.doc(userId).update({"key":""}).then(function(){
            return "User key removed!";
        });
    },

    createJob: function(userId, job){
        var collection = firebase.firestore().collection("users/"+userId+"/jobs");
        return collection.add(job).then(function(doc){
            return doc.id;
        });
    },

    updateJob: function(userId, jobId, job){

    },
    
    deleteJob: function(userId, jobId){

    }
}