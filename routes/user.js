/**
 * Created by Snie on 09.12.14.
 */
var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var bcrypt = require('bcrypt');
var SALT_WORK_FACTOR = 10;

require("../schemas/account");
var account = mongoose.model("Account");

router.put('/', function(req, res){
   if(req.user){
       account.findById(req.user._id, function(err, found){
           if(err) throw err;
           else{
               found.username= req.body.username || found.username;
               found.firstname= req.body.firstname || found.firstname;
               found.lastname=req.body.lastname || found.lastname;
               found.email= req.body.email || found.email;
               found.photo=req.body.photo || found.photo;
               console.log(found)
               found.save(function(err, saved){
                   if (err) res.status(400).end();
                   else {
                       res.status(204);
                       res.send(saved)
                   }
               });
           }
       })
   }
    else {
       res.render('./Pages/login')
   }
});

router.put('/password', function(req, res){
    if(req.user) {
        account.findById(req.user._id, function(err, found){
            if(err) throw err;
            else {
                if(req.body.newpassword !== req.body.newpassword2) res.send('password mismatch');
                else {
                    found.isValidPassword(req.body.oldpassword, function (err, isMatch) {
                        if (err) throw err;
                        if (!isMatch) res.send('incorrect password');
                        else {
                            found.password = req.body.newpassword;
                            found.save(function(err, saved){
                                        if (err) res.status(400).end();
                                        else {
                                            res.status(204);
                                            res.send(saved)
                                        }
                                    });
                        }
                    })
                }
            }
        });
    }
    else res.render('./Pages/login');
});

module.exports = router;