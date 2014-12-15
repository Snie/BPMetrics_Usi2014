
var express = require('express');
var router = express.Router();
var fs = require('fs');
var mongoose = require('mongoose');
var exec = require('child_process').exec;
var path = require("path");
require("../schemas/collection-model");
var collMod = mongoose.model("CollectionModel");
require("../schemas/model");
require("../schemas/account");
var account = mongoose.model("Account");
var statistics = require("./statistics");
var mod = mongoose.model("Model");
var seqqueue = require("seq-queue");
require("../schemas/statistics");
var stats = mongoose.model("Statistics");
require('../schemas/errors');
var errs = mongoose.model("Errors");
require("../schemas/admin");
var adminModel = mongoose.model("Admin"); 
// get the id of the anon user
var userId = "";
account.find({username: "anon"}).exec(function(err, found){userId = found[0]._id});
var userName = "Demo"


// Renders the demo page
router.get('/', function(req, res) {
    user_path = "./models/" + userId;
    if (fs.existsSync(user_path)) {
    }
    else {
        fs.mkdir(user_path);
    }
    res.render('./pages/demo');
});

// function to create a random id
function createGuid(){
    return 'xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random()*16|0, v = c === 'x' ? r : (r&0x3|0x8);
        return v.toString(16);
    });
}


router.post('/', function(req, res) {
    user_path = "./models/" + userId;
    if (fs.existsSync(user_path)) {
    }
    else {
        fs.mkdir(user_path);
    }
    var fileArray = req.files.uploaded;
    //create unique folder for collection (dir name = collection id)
    var dirId = createGuid();
    fs.mkdir("./models/" + userId + "/" + dirId);
    var queue = seqqueue.createQueue(1000);
    console.log(queue);
    var newIDs = [];
    //single model
    queue.push(
        function (task) {
            console.log("creating collection for demo file");
            sendToAdmin("creating collection for demo file", userId, userName)
            createSingleFile(fileArray, userId, dirId);
            task.done();
        }
    );
    queue.push(
        function (task) {
            sendToAdmin("executing jar for demo", userId, userName)
            console.log("executing jar for demo file");
            var target_path = "./models/" + userId + "/" + dirId + "/";
            execSingleJar(userId, dirId, userName, res, target_path, newIDs, queue);
            task.done();
        }
    );
    var response = {"id" : dirId};
    res.send(response);
});

//single model functions

function createSingleFile(fileArray, userId, dirId){
    var nameArray = fileArray.name.split(".");
    var newName = nameArray[0] + "." + nameArray[1] + ".bpmn"
    fileArray.name = newName;
    fileArray.extension = "bpmn";
    var tmp_path = fileArray.path;
    fileArray.path = "models/"+ userId + "/" + dirId + "/" + newName;
    var target_path = "./models/" + userId + "/" + dirId + "/" + fileArray.name;
    console.log("target: " + target_path);
    fs.rename(tmp_path, target_path, function(err) {
        if (err) throw err;
        fs.unlink(tmp_path, function() {
            if (err) throw err;

        });
    });
}

function execSingleJar(userId, dirId, userName, res, target_path, newIDs, queue){
    exec('java -jar bin/BPMetrics.jar ' + "models/" + userId + "/" + dirId, function(error, stdout, stderr) {
        var collection = JSON.parse(stdout);
        if (error !== null) {
            console.log('exec error: ' + error);
        }
        if (stderr !== ""){
            console.log("corrupted or wrong file, deleting...");
            sendToAdmin("corrupted or wrong file", userId, userName);
            removeDir(target_path);
            console.log("deleted");
            var errObj = new errs({
                collectionID: collection.collectionID,
                error: stderr
            });
            errObj.save(function(err, saved){
                if (err) console.log(err);
                console.log("Java error saved");
            });
            account.findById(userId).exec(function(err, found){
                if (err){throw err;}
                var acc_errs = found.errse;
                if (acc_errs !== undefined){
                    acc_errs.push(errObj._id);
                }
                else {
                    acc_errs = [errObj._id];
                }
                found.errs = acc_errs;
                found.save(function(err, saved){
                    if (err) console.log(err);
                    console.log("Java error added to account");
                    sendToAdmin("Java error added to demo", userId, userName);
                });
            });
        }
        else{
            var statistic;
            queue.push(
                function(task){
                    console.log("creating and saving demo model");
                    sendToAdmin("creating and saving demo model", userId, userName);
                    create_save_Models(newIDs, collection);
                    statistic = statistics.collectionStat(collection);
                    task.done();
                }
            );
            var array;
            queue.push(
                function(task){
                    console.log("creating demo collection");
                    sendToAdmin("creating demo collection", userId, userName)
                    array = create_Collection(userId, collection, newIDs, statistic, userName);
                    task.done();
                }
            );
            queue.push(
                function(task){
                    console.log("saving demo collection");
                    sendToAdmin("saving demo collection", userId, userName)
                    save_Collection(array, userId, userName)
                    task.done();
                }
            );
        }
    });
}


// creates the models and saves them 
function create_save_Models(newIDs, collection){
    for(var i = 0, j = collection.models.length; i < j; i++ ){
        var newModel = new mod({
            name: collection.models[i].name,
            modelID: collection.models[i].modelID,
            path: collection.models[i].path,
            metrics: JSON.stringify(collection.models[i].metrics) //to be parsed to be used as JSON
        });
        newIDs.push(newModel._id);
        newModel.save(function(err, saved){
            if (err) throw new Error;
            console.log("model saved")
        });
    }
}

// creates collection and statistics, then the statistics will be saved
function create_Collection(userId, collection, newIDs, statistic, userName){
    var newColl = new collMod({
        user: userId,
        collectionID: collection.collectionID,
        path: collection.path,
        models: newIDs
    });
    var newStat = new stats({
        statistics: JSON.stringify(statistic),
        collectionModel: newColl._id

    });
    newStat.save(function(err, s){
        console.log("stats saved");
        sendToAdmin("stats saved", userId, userName);
        if(err) res.status(400);
    });
    newColl.statistics = newStat._id;
    return [newColl, statistic];
}



// the collection is saved, with statistics, then the collection is linked to the user,
// then the account and general statistics will be uploaded and saved
function save_Collection(array, userId, userName){
    array[0].save(function(err, saved){
        if (err) res.status(400).end();
        console.log("coll saved")
        sendToAdmin("demo collection saved", userId, userName);
        account.findById(userId).exec(function(err, found){
            if (err){throw err;}
            if(found){
                var newCollections = found.collections;
                newCollections.push(array[0]._id);
                //found.collections = newCollections;
                found.save(function(err, savedaccount){
                    if(err) res.status(400);
                    account.findById(userId).populate("collections").exec(function(err, found){
                        collMod.populate(found.collections, {path:"models"}, function (err, data) {
                            var newAccStats;
                            if(found.statistics == null) {
                                newAccStats = statistics.accountStat([], array[1]);
                                console.log("created");
                                var accStats = new stats({statistics: JSON.stringify(newAccStats), account: found._id});
                                //console.log("Statistiche account nuove");
                                //console.log(JSON.stringify(accStats));
                                found.statistics = accStats._id;
                                accStats.save(function(err, s){
                                    console.log("created stats ");
                                    sendToAdmin("stats created", userId, userName);
                                    if(err) res.status(400);
                                })
                                found.save(function(err, s){
                                    if(err) res.status(400);
                                    account.find({}).populate('statistics').exec(function(err, accounts) {
                                        var all_stat_account = [accStats];
                                        for(var index = 0 ; index < accounts.length ; index++) {
                                            if(accounts[index].statistics != null) {
                                                all_stat_account.push(JSON.parse(accounts[index].statistics.statistics));
                                            }
                                        }
                                        var global_stat = statistics.globalStat(all_stat_account);
                                        stats.findOne({ global: true }).exec(function(err, found_global) {
                                            found_global.statistics = JSON.stringify(global_stat);
                                            found_global.save(function(err, found_global_save) {
                                                if(err) res.status(400);
                                            });
                                        });
                                    });
                                })
                            }
                            else{
                                console.log("updated");
                                stats.findById(found.statistics).exec(function(err, foundstat){
                                    var newAccStats = statistics.accountStat(JSON.parse(foundstat.statistics), array[1]);
                                    foundstat.statistics = JSON.stringify(newAccStats);
                                    foundstat.save(function(err, s){
                                        console.log("updated stats");
                                        sendToAdmin("stats updated", userId, userName)
                                        if(err) res.status(400);
                                    });
                                    found.save(function(err, s){
                                        if(err) res.status(400);
                                        account.find({}).populate('statistics').exec(function(err, accounts) {
                                            var all_stat_account = [];
                                            for(var index = 0 ; index < accounts.length ; index++) {
                                                if(accounts[index].statistics != null) {
                                                    all_stat_account.push(JSON.parse(accounts[index].statistics.statistics));
                                                }
                                            }
                                            var global_stat = statistics.globalStat(all_stat_account);
                                            stats.findOne({ global: "true" }).exec(function(err, found_global) {
                                                console.log("global " + found_global);
                                                found_global.statistics = JSON.stringify(global_stat);
                                                found_global.save(function(err, found_global_save) {
                                                    if(err) res.status(400);
                                                    sendToAdmin("global stats updated", userId, userName)
                                                });
                                            });
                                        });
                                    })
                                });
                            }
                            //astat = statistics.accountStat(found.statistics, JSON.parse(array[1].statistics) );
                            //found.statistics = JSON.stringify(astat);
                        })
                    })

                });

            }
            else{
                console.log("account not found");
            }
        });
    });
}

// it's a function to recursively remove a directory
function removeDir(dir) {
    var list = fs.readdirSync(dir);
    for(var i = 0; i < list.length; i++) {
        var filename = path.join(dir, list[i]);
        var stat = fs.statSync(filename);

        if(filename == "." || filename == "..") {
            // pass these files
        } else if(stat.isDirectory()) {
            // rmdir recursively
            rmdir(filename);
        } else {
            // rm fiilename
            fs.unlinkSync(filename);
        }
    }
    fs.rmdirSync(dir);
};

function sendToAdmin(process, userId, userName){
    adminModel.find({username: "admin"}).exec(function(err, admin){
        if (admin[0].ongoing.length  >= 100){
            admin[0].ongoing.shift();
            admin[0].ongoing.push(userId + ' , ' + userName + ' : ' + process);
        }
        else{
            admin[0].ongoing.push(userId + ' , ' + userName + ' : ' + process);
        }
        admin[0].save(function(err, sav){
            if (err) console.log(err);
            console.log("sent to admin");
        })
    })
}



module.exports = router;


