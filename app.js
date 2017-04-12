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
mongoose.connect('mongodb://localhost/loginapp');  // Here's our db
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

// Pass in file references for the routes
app.use('/', routes);
app.use('/users', users);

// Set port 
app.set('port', (process.env.PORT || 3000));

// Start app
app.listen(app.get('port'), function() {
  console.log('Server listening on port ' + app.get('port'));
});
