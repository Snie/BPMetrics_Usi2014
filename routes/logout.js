/**
 * Created by Snie on 29.11.14.
 */
var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var passport = require("passport");
require("../passportConfig");

router.get('/', function(req, res) {
    req.logout();
    res.redirect('/login');
});

module.exports = router;