'use strict';

var mongoose = require('mongoose');
var ObjectId = mongoose.Schema.Types.ObjectId;

var MetricSchema = new mongoose.Schema({
    name: { type: String, required: true },
    category: { type: String, required: true, enum:["SIZE", "STRUCTURAL", "EXTERNAL_INTERACTION", "DATA_HANDLING", "COMPLEXITY"] },
    type: { type: String, required: true, enum: ["SINGLE_VALUE", "DISTRIBUTION", "TYPE_DISTRIBUTION", "DISTRIBUTION_STATISTIC"] },
    values: { type: [ObjectId], default:[], ref: "Value" }
});

//register model
mongoose.model('Metric', MetricSchema);