/**
 * Created by Snie on 25.11.14.
 */
var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
require("../utils/passportConfig");

require("../schemas/account");
var account = mongoose.model("Account");

router.get('/', function(req, res){
    res.render('./signUp')
});
router.post("/", function(req,res){
    account.findOne({username: req.body.username}, function(err, found){
        if(found) {
            res.status(400);
            res.send("username");
        }
        else{
            account.findOne({email: req.body.email}, function(err, found2) {
                if (err) { throw err; }
                if(found2) {
                    res.status(400);
                    res.send("email");
                }
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
                        res.status(204);
                        res.send();
                    });
                }
            });
        }
    })
})


module.exports = router;