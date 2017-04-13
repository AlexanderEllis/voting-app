var express = require('express'); // Used for middleware and request handling
var path = require('path');  // Used to access the views directory
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var exphbs = require('express-handlebars');  // Adding view engine to express
var expressValidator = require('express-validator');  // Validating form input
var flash = require('connect-flash');  // Allowing flash messages
var session = require('express-session'); 
var passport = require('passport');  // Authentication
var LocalStrategy = require('passport-local').Strategy;  // Local authentication strategy
var mongo = require('mongodb');  // Simple db
var mongoose = require('mongoose');  // Simple db schemas
mongoose.connect('mongodb://localhost/Voting-app');  // Here's our db
var db = mongoose.connection;

// Include the files to use for routes
// In these files, define the custom express router for different types of http requests
var routes = require('./routes/index')
var users = require('./routes/users');


// Initialize app
var app = express();

// Set static folder to be in public folder
app.use(express.static(path.join(__dirname, 'public')));

// Set our view directory
app.set('views', path.join(__dirname, 'views'));

// Set app engine to handlebars
app.engine('handlebars', exphbs({ defaultLayout: 'layout' }));
app.set('view engine', 'handlebars');


// Add in middleware

// bodyParser middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

// Middleware for express session
app.use(session({
  secret: 'secret',
  saveUninitialized: true,
  resave: true
}));

// Passport initialization
app.use(passport.initialize());
app.use(passport.session());

// Express validator
// From https://www.npmjs.com/package/express-validator
// Here, the formParam value is going to be morphed into form body format useful for printing
app.use(expressValidator({
  errorFormatter: function(param, msg, value) {
    let namespace = param.split('.');
    let root = namespace.shift();
    let formParam = root;

    while(namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }
    return {
      param: formParam,
      msg: msg,
      value: value
    };
  }
}));

// Connect for flash messages
app.use(flash());

// 'Global' variables for flash messages
// Uses 'global' varialbes by assigning to res.locals
app.use(function (req, res, next) {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  res.locals.user = req.user || null;
  next();
});

// Pass in file references for the routes
app.use('/', routes);
app.use('/users', users);

// Set port 
app.set('port', (process.env.PORT || 3000));

// Start app
app.listen(app.get('port'), function() {
  console.log('Server listening on port ' + app.get('port'));
});
