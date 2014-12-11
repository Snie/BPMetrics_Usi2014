/**
/**
 * Created by Snie on 29.11.14.
 */
var express = require('express');
var router = express.Router();
var fs = require('fs');
var mongoose = require('mongoose');

//require mongoose models
require("../schemas/collection-model");
var collMod = mongoose.model("CollectionModel");
require("../schemas/model");
var statistics = require("./statistics");
var mod = mongoose.model("Model");
require("../schemas/account");
var account = mongoose.model("Account");



//get all collection-models
router.get('/', function(req, res) {
    if(req.user) {
        collMod.find({}).populate("models").exec(function (err, found) {
            if (err) throw (err);
            res.json(found)
        });
    }
    else res.redirect('login')
});

//get a model by id
router.get('/mod/:id', function(req, res) {
    if(req.user) {
    var id = req.params.id;
        mod.findById(id, function(err, found){
            if(err )throw(err);
            if(!found) res.status(404);
            else res.json(found);
        })
    }
    else res.redirect('login')
});

router.delete('/mod/:id', function(req, res) {
    if(req.user) {
    var id = req.params.id;
    mod.remove(id, function(err, found){
        if(err )throw(err);
        if(!found) res.status(404).end();
        else res.status(204).end();
    })
    }
    else res.redirect('login')
});

//get currently logged user's collections
router.get('/my', function(req, res) {
    if(req.user) {
        var id = req.user._id;
        collMod.find({user: id}).populate("models").exec(function (err, found) {
            if (err) throw (err);
            //found.populate("models");
            res.json(found)
        });
    }
    else res.redirect('../login')
});


router.get('/my/statistics', function(req, res) {
    if(req.user) {
        var id = req.user._id;
        account.findById(id).populate("statistics").exec(function (err, found) {
            if (err) throw (err);
            res.json(found.statistics)
        });
    }
    else res.redirect('../login')
});

//get collection-model by id
router.get('/:id', function(req, res) {
    if(req.user) {
        var id = req.params.id;
        collMod.findOne(id).populate('models').exec(function (err, found) {
            if (err) throw (err);
            res.send(found);

        });
    }
    else res.redirect('../login')
});

router.get('/demo/:id', function(req, res) {
    if(req.user) {
        var id = req.params.id;
        collMod.find({collectionID: id}).exec(function (err, found) {
            if (err) throw (err);
            res.send(found);

        });
    }
    else res.redirect('../login')
});

//get statistics from collection

router.get('/collection/statistics/:id', function(req, res){
    statistics.find({collectionModel: req.params.id}, function(err, found){
        if(err) throw err;
        if(found.length < 1) res.send('wrong id');
        else{
            res.json(found[0])
        }
    })
});

//delete collection by id
router.delete('/:id', function(req, res) {
    if(req.user) {
        var id = req.params.id;
        collMod.findById(id, function(err, found){
            if(err )throw(err);
            if(!found) res.status(404).end();
            else {
                found.user = null;
                found.save(function (err, saved) {
                    if (err) res.status(400).end();
                    else {
                        res.status(204);
                        res.send(saved)
                    }
                });
            }
        });
    }
    else res.redirect('../login')
});
module.exports = router;