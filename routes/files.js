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

/* GET home page. */
router.get('/', function(req, res) {
    if(req.user) {
        var userId = req.user._id;
        var userName = req.user.username;
        user_path = "./models/" + userId;
        if (fs.existsSync(user_path)) {
        }
        else {
            fs.mkdir(user_path);
        }
        res.render('./Pages/dashboard', { username: userName });
    }
    else res.redirect('/login');
});


function createGuid(){
    return 'xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random()*16|0, v = c === 'x' ? r : (r&0x3|0x8);
        return v.toString(16);
    });
}


router.post('/', function(req, res) {
    var userId = req.user._id;
    var userName = req.user.username;
    var fileArray = req.files.uploaded;
    //create unique folder for collection (dir name = collection id)
    var dirId = createGuid();
    fs.mkdir("./models/" + userId + "/" + dirId);
    var queue = seqqueue.createQueue(1000);
    var newIDs = [];
    //multiple models
    if (fileArray.length > 1) {
        queue.push(
            function (task) {
                console.log("creating collection");
                createMultipleFiles(fileArray, userId, dirId);
                task.done();
            }
        );
        queue.push(
            function (task) {
                console.log("executing jar for collection");
                var target_path = "./models/" + userId + "/" + dirId + "/";
                execMultipleJar(userId, dirId, userName, target_path, newIDs, res, queue);
                task.done();
            }
        );
    }
    //single model
    else {
        queue.push(
            function (task) {
                console.log("creating collection for single file");
                createSingleFile(fileArray, userId, dirId);
                task.done();
            }
        );
        queue.push(
            function (task) {
                console.log("executing jar for single file");
                var target_path = "./models/" + userId + "/" + dirId + "/";
                execSingleJar(userId, dirId, userName, res, target_path, newIDs, res, queue);
                task.done();
            }
        );
    }
    var response = {"id" : dirId};
    res.send(response);
});


//multiple model functions

function createMultipleFiles(fileArray, userId, dirId){
    for (var x = 0; x < fileArray.length; x++){
        createSingleFile(fileArray[x], userId, dirId);
    }
}

function execMultipleJar(userId, dirId, userName, target_path, newIDs, res, queue){
    exec('java -jar bin/BPMetrics.jar ' + "models/" + userId + "/" + dirId, function(error, stdout, stderr) {
        var collection = JSON.parse(stdout);
        console.log(stderr);
        if (error !== null) {
            console.log('exec error: ' + error);
        }
        if (stderr !== ""){
            console.log("corrupted or wrong file, deleting...");
            removeDir(target_path);
            console.log("deleted");
            var newColl = new collMod({
                user: userId,
                collectionID: collection.collectionID,
                path: "",
                models: newIDs,
                gotError: true,
                error: stderr
            });
            newColl.save(function(err, saved){
                if (err) throw new Error;
                console.log("Java error saved");
            });
            queue.close(true)
        }
        else {
            var statistic;
            queue.push(
                function(task){
                    console.log("creating and saving models");
                    create_save_Models(newIDs, collection);
                    statistic = statistics.collectionStat(collection);
                    task.done();
                }
            );
            var array;
            queue.push(
                function(task){
                    console.log("creating collection");
                    array = create_Collection(userId, collection, newIDs, statistic);
                    task.done();
                }
            );
            queue.push(
                function(task){
                    console.log("saving collection");
                    save_Collection(array, userId);
                    task.done();
                }
            );
            queue.push(
                function(task){
                    console.log("creating charts");
                    //account.findById(userId, function(err, found){
                    //    //var accstats = JSON.parse(found.statistics);
                    //    //res.render("./Pages/dashboard", { username: userName });
                    //});
                    task.done();
                }
            );

        }
    });
}

//single model functions

function createSingleFile(fileArray, userId, dirId){
    var nameArray = fileArray.name.split(".");
    var newName = nameArray[0] + "." + nameArray[1] + ".bpmn"
    fileArray.name = newName;
    fileArray.extension = "bpmn";
    var tmp_path = fileArray.path;
    fileArray.path = "models/"+ userId + "/" + dirId + "/" + newName;
    var target_path = "./models/" + userId + "/" + dirId + "/" + fileArray.name;
    fs.rename(tmp_path, target_path, function(err) {
        if (err) throw err;
        fs.unlink(tmp_path, function() {
            if (err) throw err;

        });
    });
}

function execSingleJar(userId, dirId, userName, res, target_path, newIDs, res, queue){
    exec('java -jar bin/BPMetrics.jar ' + "models/" + userId + "/" + dirId, function(error, stdout, stderr) {
        var collection = JSON.parse(stdout);
        if (error !== null) {
            console.log('exec error: ' + error);
        }
        if (stderr !== ""){
            console.log("corrupted or wrong file, deleting...");
            removeDir(target_path);
            console.log("deleted");
            var newColl = new collMod({
                user: userId,
                collectionID: collection.collectionID,
                path: "",
                models: newIDs,
                gotError: true,
                error: stderr
            });
            newColl.save(function(err, saved){
                if (err) throw new Error;
                console.log("Java error saved")
            });
            queue.close(true)
        }
        else{
            var statistic;
            queue.push(
                function(task){
                    console.log("creating and saving models");
                    create_save_Models(newIDs, collection);
                    statistic = statistics.collectionStat(collection);
                    task.done();
                }
            );
            var array;
            queue.push(
                function(task){
                    console.log("creating collection");
                    array = create_Collection(userId, collection, newIDs, statistic);
                    task.done();
                }
            );
            queue.push(
                function(task){
                    console.log("saving collection");
                    save_Collection(array, userId);
                    task.done();
                }
            );
            var singleValues = [];
            queue.push(
                function(task){
                    console.log("selecting singleValues");
                    var metrics = collection.models[0].metrics;
                    for(var x = 0; x <metrics.length; x++){
                        if (metrics[x].type == "SINGLE_VALUE"){
                            singleValues.push(metrics[x]);
                        }
                    }
                    task.done();
                }
            );
            queue.push(
                function(task){
                    console.log("creating charts");
                    single(userName, singleValues, res);
                    task.done();
                }
            );
        }
    });
}

function single(userName, singleValues, res){
    // See SINGLE_VALUE's of the uploaded model
    //res.render("./Pages/dashboard", { username: userName });
}

function single_acc_stats(userId, userName, singleValues, res){
    // Compare SINGLE_VALUES of the uploaded file with the account statistics
    account.findById(userId, function(err, found){
        var accstats = JSON.parse(found.statistics);
        //res.render("./Pages/dashboard", { username: userName });
    });
}

function stats_acc_stats(userId, userName, stats, res){
    // Compare collection statistics of uploaded model with account statistics
    account.findById(userId, function(err, found){
        var accstats = JSON.parse(found.statistics);
        //res.render("./Pages/dashboard", { username: userName });
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
                            console.log("asdasd: " + found);
                            console.log("stats: " + found.statistics);
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
                                    console.log(s);
                                    if(err) res.status(400);
                                    account.find({}).populate('statistics').exec(function(err, accounts) {
                                        var all_stat_account = [accStats];
                                        for(var index = 0 ; index < accounts.length ; index++) {
                                            all_stat_account.push(JSON.parse(accounts[index].statistics.statistics));
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
                                                all_stat_account.push(JSON.parse(accounts[index].statistics.statistics));
                                            }
                                            var global_stat = statistics.globalStat(all_stat_account);
                                            stats.findOne({ global: "true" }).exec(function(err, found_global) {
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


