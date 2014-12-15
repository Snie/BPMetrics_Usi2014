'use strict';

var mongoose = require('mongoose');
var ObjectId = mongoose.Schema.Types.ObjectId;

var CollectionModelSchema = new mongoose.Schema({
    user: { type: String, required: true },
    collectionID: { type: String, required: true, default: "SingleModel" },
    path: { type: String, required: true },
    models: [{ type: ObjectId, ref: "Model" }],
    statistics: { type: ObjectId, ref:"Statistics" }, // id of statistics related
    gotError: {type: Boolean, default: false },
    error: {type: String, default: ""}
});

//register model
mongoose.model('CollectionModel', CollectionModelSchema);