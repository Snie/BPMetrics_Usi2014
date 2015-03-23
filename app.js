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
require("./schemas/");
var account = mongoose.model("Account");
require("./utils/passportConfig");
var app = express();

function createGuid() {
    return 'xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random()*16|0, v = c === 'x' ? r : (r&0x3|0x8);
        return v.toString(16);
    });
}

//connect to mongoose
mongoose.connect(config.mongoUrl+config.mongoDbName);

//// Register model definition here
//require('./schemas/');

app.use(compression({
    threshold: 512
}));


// view engine setup to use html
app.set('views', path.join(__dirname, 'views'));
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

//multer helps with the upload of the file to the server, it also does a rename of the file before the upload
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

//setup of passport
app.use(session({ secret: 'keyboard cat' , cookie: { maxAge: null }}));
app.use(passport.initialize());
app.use(passport.session());


//routes

var models = require("./routes/models");
app.use('/bpmetrics/models', models);

var user = require("./routes/user");
app.use('/bpmetrics/user', user);

var index = require("./routes/index");
app.use('/bpmetrics', index);

var demo = require("./routes/demo");
app.use('/bpmetrics/demo', demo);

var login = require("./routes/login");
app.use('/bpmetrics/login', login);

var signup = require("./routes/signup");
app.use("/bpmetrics/signup", signup);

var files = require("./routes/files");
app.use("/bpmetrics/files", files);

var logout = require("./routes/logout");
app.use("/bpmetrics/logout", logout);

var demofiles = require("./routes/demofiles");
app.use("/bpmetrics/demofiles", demofiles);

var admin = require("./routes/admin");
app.use("/bpmetrics/admin", admin);

var team = require("./routes/team");
app.use("/bpmetrics/team", team);

app.get('/', function (req, res) {
    res.redirect("http://design.inf.usi.ch/research/projects/benchflow");
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
    //res.redirect("http://design.inf.usi.ch/research/projects/benchflow");
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