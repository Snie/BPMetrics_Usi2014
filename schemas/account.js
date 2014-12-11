'use strict';

var mongoose = require('mongoose');
var ObjectId = mongoose.Schema.Types.ObjectId;
var bcrypt = require('bcrypt');
var SALT_WORK_FACTOR = 10;

var AccountSchema = new mongoose.Schema({
    username: { type: String, required: true },
    firstname: { type: String, required: true, default: '' },
    lastname: { type: String, required: true, default: '' },
    password: { type: String, required: true },
    email: { type: String, required: true },
    photo: { type: String, default: '' },
    timeCreated: { type: Date, default: Date.now },
    collections: [{ type: ObjectId, ref: "CollectionModel" }],
    statistics: { type: ObjectId, ref: "Statistics" } // id of statistics related
});

AccountSchema.pre('save', function(next) {
    var account = this;
    // return if the password was not modified.
    if (!account.isModified('password')) {
        return next();
    }
    bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
        if (err) {
            return next(err);
        }
        bcrypt.hash(account.password, salt, function(err, hash) {
            if (err) {
                return next(err);
            }
            account.password = hash;
            next();
        });
    });
});

AccountSchema.methods.isValidPassword = function isValidPassword(candidate, callback) {
    bcrypt.compare(candidate, this.password, function onPwdCompare(err, isMatch) {
        if (err) {
            return callback(err);
        }
        callback(null, isMatch);
    });
};

//register model
mongoose.model('Account', AccountSchema);