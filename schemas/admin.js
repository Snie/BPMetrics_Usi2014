'use strict';

var mongoose = require('mongoose');

var AdminSchema = new mongoose.Schema({
    username: { type: String, default: "admin" },
    ongoing: [{type: String}]
});

//register model
mongoose.model('Admin', AdminSchema);