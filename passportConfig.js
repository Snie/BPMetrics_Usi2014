var mongoose = require("mongoose");
var passport = require('passport');
var User = mongoose.model("Account")
var LocalStrategy = require('passport-local').Strategy

//configure passport
passport.use    (new LocalStrategy(
    function(username, password, done) {
        User.findOne({ username: username }, function (err, user) {

            if (err) { return done(err); }
            if (!user) {
                return done(null, false, { message: 'Incorrect username.' });
            }
            user.isValidPassword(password,function(err,isMatch){

                if(err){return done(err)}
                if(!isMatch){
                    return done(null, false, { message: 'Incorrect password.' })
                }
                else{
                    return done(null, user);
                }
            })

        });
    }
));

passport.serializeUser(function(user, done) {
    console.log('serializeUser: ' + user._id + " / " + user.username);
    done(null, user._id);
});

passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
        done(err, user);
    });
});