/**
 * Created by Snie on 27.11.14.
 */
var express = require('express');
var router = express.Router();
var fs = require('fs');
var mongoose = require('mongoose');
var exec = require('child_process').exec;
// var userId = mongoose.Types.ObjectId('547c3957314389ce9f9edb59');
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
var userId = "";
account.find({username: "anon"}).exec(function(err, found){userId = found[0]._id});
var userName = "Demo"

/* GET home page. */
router.get('/', function(req, res) {
    user_path = "./models/" + userId;
    if (fs.existsSync(user_path)) {
    }
    else {
        fs.mkdir(user_path);
    }
    res.render('./Pages/demo');
});


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
            createSingleFile(fileArray, userId, dirId);
            task.done();
        }
    );
    queue.push(
        function (task) {
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
                });
            });
        }
        else{
            var statistic;
            queue.push(
                function(task){
                    console.log("creating and saving demo model");
                    create_save_Models(newIDs, collection);
                    statistic = statistics.collectionStat(collection);
                    task.done();
                }
            );
            var array;
            queue.push(
                function(task){
                    console.log("creating demo collection");
                    array = create_Collection(userId, collection, newIDs, statistic);
                    task.done();
                }
            );
            queue.push(
                function(task){
                    console.log("saving demo collection");
                    save_Collection(array, userId);
                    task.done();
                }
            );
        }
    });
}

//createCollection functions

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

function create_Collection(userId, collection, newIDs, statistic){
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
        if(err) res.status(400);
    });
    newColl.statistics = newStat._id;
    return [newColl, statistic];
}

function save_Collection(array, userId){
    array[0].save(function(err, saved){
        if (err) res.status(400).end();
        console.log("coll saved")
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

module.exports = router;

