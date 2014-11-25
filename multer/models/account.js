'use strict';

var mongoose = require('mongoose');
var ObjectId = mongoose.Schema.Types.ObjectId;

var AccountSchema = new mongoose.Schema({
    username: { type: String, required: true},
    firstname: { type: String, default: '' },
    lastname: { type: String, default: '' },
    timeCreated: { type: Date, required: true, default: Date.now },
    collections: { type: [ObjectId], default:[], ref: "CollectionModel" }
});

//register model
mongoose.model('Account', AccountSchema);