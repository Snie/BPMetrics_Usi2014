
var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var passport = require("passport");
require("../passportConfig");
require("../schemas/admin");
var adminModel = mongoose.model("Admin"); 
var admin;
adminModel.findOne({username: 'admin'}, 
	function(err, found){
	if (err) console.log(err);
	admin = found;
});

router.get('/', function(req, res) {
    res.render('./admin');
});


router.get('/processes', function(req, res){
	var processes = {ongoing : []};
	adminModel.findById(admin._id).exec(function(err, found){
		processes.ongoing = found.ongoing;
		res.json(processes);
	});
})

module.exports = router;