'use strict';

var mongoose = require('mongoose');

var ModelSchema = new mongoose.Schema({
    name: { type: String, required: true },
    modelID: { type: String, required: true },
    path: { type: String, required: true },
    metrics: { type: String, default: '' }
});

//register model
mongoose.model('Model', ModelSchema);