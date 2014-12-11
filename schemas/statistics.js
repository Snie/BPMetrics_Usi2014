'use strict';

var mongoose = require('mongoose');
var ObjectId = mongoose.Schema.Types.ObjectId;

var StatisticsSchema = new mongoose.Schema({
    statistics: { type: String, required: true, default: '' },
    collectionModel: { type: ObjectId, ref: "CollectionModel" }, // id of a collection or account
    account: { type: ObjectId, ref: "Account" },
    global: { type: Boolean, default: false }
});

//register model
mongoose.model('Statistics', StatisticsSchema);