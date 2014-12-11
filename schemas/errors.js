/**
 * Created by nicololinder on 11/12/14.
 */
var mongoose = require("mongoose");
var ObjectId = mongoose.Schema.Types.ObjectId;

var ErrorSchema = new mongoose.Schema({
    collectionID : {type: String, required: true},
    error : {type: String, required: true}
});

mongoose.model('Errors', ErrorSchema);