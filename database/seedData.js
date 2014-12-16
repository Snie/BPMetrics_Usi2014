'use strict';

var mongoose = require('mongoose');
var ObjectId = mongoose.Types.ObjectId;

var accounts = {
    name : 'Account',
    data : [
        {
            "_id": ObjectId(),
            "username": "anon",
            "firstname": "Anonymous",
            "lastname": "Anonymous",
            "password": "anon12",
            "email": "email@usi.ch",
            "collection": [],
            "statistics": null
        },
        {
            "_id": ObjectId(),
            "username": "admin",
            "firstname": "admin",
            "lastname": "admin",
            "password": "admin1",
            "email": "admin@usi.ch",
            "collection": [],
            "statistics": null
        }
    ]
}

var metric_enum = {
    name : 'Enum',
    data : [
        {
            "_id": ObjectId(),
            "category": ["SIZE", "STRUCTURAL", "EXTERNAL_INTERACTION", "DATA_HANDLING", "COMPLEXITY"],
            "type": ["SINGLE_VALUE", "DISTRIBUTION", "TYPE_DISTRIBUTION", "DISTRIBUTION_STATISTIC"]
        }
    ]
}

var global_statistis = {
    name : 'Statistics',
    data : [
        {
            "_id": ObjectId(),
            "statistics": "[]",
            global: true
        }
    ]
}

var admin = {
    name: 'Admin',
    data: [{
        "_id": ObjectId(),
        "username" : "admin",
        "ongoing" : []
    }]
}

var seedData = [];
seedData.push(accounts);
seedData.push(metric_enum);
seedData.push(global_statistis);
seedData.push(admin);

module.exports = seedData;
