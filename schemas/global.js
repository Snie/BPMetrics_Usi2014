'use strict';

var mongoose = require('mongoose');

var GlobalSchema = new mongoose.Schema({
    statistics: { type: String, default: ''}
});

//register model
mongoose.model('Global', GlobalSchema);