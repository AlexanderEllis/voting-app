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


// Initialize app
var app = express();

app.use('*', function(req, res) {
  res.end('App received your request.');
})

// Set prot
app.set('port', (process.env.PORT || 3000));

// Start app
app.listen(app.get('port'), function() {
  console.log('Server listening on port ' + app.get('port'));
});
