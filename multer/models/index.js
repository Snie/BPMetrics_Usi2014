/** @module models/index.js
 * Loads all models
 */
'use strict';

var mongoose = require('mongoose');

require('./account');
require('./collection-model');
require('./metric');
require('./model');
require('./value');

module.exports = {
    'Account' : mongoose.model('Account'),
    'CollectionModel' : mongoose.model('CollectionModel'),
    'Metric' : mongoose.model('Metric'),
    'Model' : mongoose.model('Model'),
    'Value' : mongoose.model('Value')
}
