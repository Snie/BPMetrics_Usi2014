/**
 * Created by Snie on 09.12.14.
 */
var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');

router.get('/', function(req, res){
    res.render('./pages/index', {});
});

router.get('/demoo', function(req, res){
    res.redirect('/demo');
});

router.get('/dashboard', function(req, res){
    res.redirect('/dashboard');
});

module.exports = router;