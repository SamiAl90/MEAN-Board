/**
 * This file creates an app object and adds all
 * needed requirements.
 * This object is used to start the nodeJS server.
 */

// default express modules
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

// added 3rd party modules
var mongoose = require('mongoose');
var session = require('client-sessions');

// custom modules
var permission = require('./routes/lib/permission');

// default express routes
var routes = require('./routes/index');

// custom routes
var users = require('./routes/users');
var categories = require('./routes/categories');
var threads = require('./routes/threads');
var posts = require('./routes/posts');
var messages = require('./routes/messages');

// custom models
var User = require('./models/User');

// connect to mongodb
mongoose.connect('mongodb://localhost/meanDB', function(err){
	if(err) {
		console.log('connection error', err);
	} else {
		console.log('connection successful');
	}
});

// create app
var app = express();

// config app
app.locals.pretty = true;

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// START -> middleware
app.use(bodyParser.urlencoded({ extended: true }));

// middleware: handle session
app.use(session({
	cookieName: 'session',
	secret: 'sdgfzdcgsabvdez65t6ds5t38fgd6563q84r6dgdvc876q4w', // later we will change it
	duration: 30 * 60 * 1000, // 30minutes
	activeDuration: 5 * 60 * 1000, // 5minutes
	httpOnly: true, // don't let javascript access the cookie
	secure: true, // only use cookies over https
	ephemeral: true // delte cookie when browser close
}));

// middleware: add a user attribute to the req object, needed for permissions
app.use(function(req, res, next){
	if(req.session && req.session.user){
		User.findOne({userName: req.session.user.userName}, function(err, user){
			if(err){
				return next(err);
			} else if(user){
				user.password = ''; //overwrite pass
				req.user = user;
				req.session.user = user;
				res.locals.user = user;
				next();
			}
		});
	} else {
		next();
	}
});

// middleware: secure API with ACLs
app.use('/api', permission.secureApi);

// use default express middleware
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// use default express routes
app.use('/', routes);

// use custom routes
app.use('/api/user', users);
app.use('/api/category', categories);
app.use('/api/thread', threads);
app.use('/api/post', posts);
app.use('/api/message', messages);

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
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;
