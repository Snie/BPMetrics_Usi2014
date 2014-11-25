'use strict';

var mongoose = require('mongoose');
var ObjectId = mongoose.Schema.Types.ObjectId;

var ModelSchema = new mongoose.Schema({
    name: { type: String, required: true },
    modelID: { type: String, required: true },
    path: { type: String, required: true },
    metrics: { type: [ObjectId], default:[], ref: "Metric" }
});

//register model
mongoose.model('Model', ModelSchema);