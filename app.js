var config = require('./config');
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var multer  = require('multer');
var mongoose = require("mongoose");
var passport = require("passport");
var LocalStrategy = require('passport-local').Strategy;
var session = require('express-session');
var compression = require('compression')
require("./schemas/account");
var account = mongoose.model("Account");
require("./passportConfig");
var app = express();

function createGuid()
{
    return 'xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random()*16|0, v = c === 'x' ? r : (r&0x3|0x8);
        return v.toString(16);
    });
}

//connect to mongoose
mongoose.connect(config.mongoUrl+config.mongoDbName);

// Register model definition here
require('./schemas/');

app.use(compression({
    threshold: 512
}));


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

app.use(multer({
    dest: './models/',
    rename: function (fieldname, filename) {
        var array = filename.split(".");
        var randomId = createGuid();
        var name_ext = randomId + "." + array[0]  + ".bpmn";
        return name_ext;
    }
}));

// uncomment after placing your favicon in /public
app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({ secret: 'keyboard cat' }));
app.use(passport.initialize());
app.use(passport.session());


//routes

var models = require("./routes/models");
app.use('/models', models);

var user = require("./routes/user");
app.use('/user', user);

var index = require("./routes/index");
app.use('/', index);

var demo = require("./routes/demo");
app.use('/demo', demo);

var login = require("./routes/login");
app.use('/login', login);

var signup = require("./routes/signup");
app.use("/signup", signup);

var files = require("./routes/files");
app.use("/files", files);

var logout = require("./routes/logout");
app.use("/logout", logout);

var demofiles = require("./routes/demofiles");
app.use("/demofiles", demofiles);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.send(err);
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.send(err);
});

module.exports = app;