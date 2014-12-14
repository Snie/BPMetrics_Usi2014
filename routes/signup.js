/**
 * Created by Snie on 25.11.14.
 */
var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
require("../passportConfig");

require("../schemas/account");
var account = mongoose.model("Account");

router.get('/', function(req, res){
    res.render('./pages/signUp')
});
router.post("/", function(req,res){
    account.findOne({username: req.body.username}, function(err, found){
        if(found)  res.send("username already used");
        else{
            account.findOne({email: req.body.email}, function(err, found2) {
                if (err){throw err;}
                if(found2) res.send("Email already in use");
                else if(req.body.password !== req.body.repeatPassword) res.send('password mismatch');
                else {
                    var newAccount = new account({
                        username: req.body.username,
                        firstname: req.body.firstname,
                        lastname: req.body.lastname,
                        password: req.body.password,
                        email: req.body.email,
                        timeCreated: req.body.timecreated || Date.now()
                    });
                    newAccount.save(function (err, saved) {
                        if (err) res.status(400).end();
                    });
                    res.render("./pages/index");
                }
            });

        }
    })


})


module.exports = router;