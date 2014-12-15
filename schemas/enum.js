'use strict';

var mongoose = require('mongoose');

var EnumSchema = new mongoose.Schema({
    category: { type: [String], default:[] },
    type: { type: [String], default:[] }
});

//register model
mongoose.model('Enum', EnumSchema);