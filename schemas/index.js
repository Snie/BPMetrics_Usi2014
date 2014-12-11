/** @module models/index.js
 * Loads all models
 */
'use strict';

var mongoose = require('mongoose');

require('./account');
require('./collection-model');
require('./enum');
require('./statistics');
require('./model');

module.exports = {
    'Account' : mongoose.model('Account'),
    'CollectionModel' : mongoose.model('CollectionModel'),
    'Enum': mongoose.model('Enum'),
    'Statistics': mongoose.model('Statistics'),
    'Model' : mongoose.model('Model')
}