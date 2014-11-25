'use strict';

var mongoose = require('mongoose');

var ValueSchema = new mongoose.Schema({
    name: { type: String, required: true, default:"" },
    value: { type: Number, required: true }
});

//register model
mongoose.model('Value', ValueSchema);