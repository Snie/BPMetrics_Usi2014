'use strict';

var mongoose = require('mongoose');
var ObjectId = mongoose.Types.ObjectId;

var accounts = {
    name : 'Account',
    data : [
        {
            "username": "username1",
            "firstname": "firstname1",
            "lastname": "lastname1",
            "timeCreated": "Mon Sep 29 1986 00:00:00 GMT+0100 (CET)",
            "collection": []
        },
        {
            "username": "username2",
            "firstname": "firstname2",
            "lastname": "lastname2",
            "timeCreated": "Mon Sep 29 1986 00:00:00 GMT+0100 (CET)",
            "collection": []
        }
    ]
}

var seedData = [];
seedData.push(accounts);

module.exports = seedData;
