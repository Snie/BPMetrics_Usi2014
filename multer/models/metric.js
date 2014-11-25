'use strict';

var mongoose = require('mongoose');
var ObjectId = mongoose.Schema.Types.ObjectId;

var MetricSchema = new mongoose.Schema({
    name: { type: String, required: true },
    category: { type: String, required: true, enum:["Size", "Structure", "External Interaction", "Data Handling", "Complexity"] },
    type: { type: String, required: true, enum: ["SingleValue", "Distribution", "TypeDistribution"] },
    value: { type: [ObjectId], default:[], ref: "Value" }
});

//register model
mongoose.model('Metric', MetricSchema);