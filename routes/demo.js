/**
 * Created by Snie on 09.12.14.
 */
var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');

router.get('/', function(req, res){
    res.render('./demo')
});

module.exports = router;