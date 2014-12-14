/**
 * Created by Snie on 25.11.14.
 */
var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var fs = require("fs");
var passport = require("passport");
require("../passportConfig");

require("../schemas/account");
var account = mongoose.model("Account");

router.get('/', function(req, res){
    res.render('./pages/login');
});
router.post("/", passport.authenticate('local'),
    function(req, res) {
        res.redirect('/files');
    });

module.exports = router;

