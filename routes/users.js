var express = require('express');
var router = express.Router();
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

// Allows us to access user mongoose model
var User = require('../models/user');

// GET the register page
router.get('/register', function(req, res) {
  res.render('register');
});

// GET the login page
router.get('/login', function(req, res) {
  res.render('login');
});

// POST to the register page
router.post('/register', function(req, res) {
  // We use body-parser to access the body as json, which makes it easy here
  let name = req.body.name;
  let email = req.body.email;
  let username = req.body.username;
  let password = req.body.password;
  let password2 = req.body.password2;

  // Validation using express-validator
  req.checkBody('name', 'Name is required').notEmpty();
  req.checkBody('email', 'Email is required').notEmpty();
  req.checkBody('email', 'Email is not valid').isEmail();
  req.checkBody('username', 'Username is required').notEmpty();
  req.checkBody('password', 'Password is required').notEmpty();
  req.checkBody('password2', 'Passwords do not match').equals(req.body.password);

  // Grab any errors from validation
  let errors = req.validationErrors();

  // If there are any errors, we will pass the errors to the register page.  Handlebars with receive the object and
  // parse from there.  Each error is an object that looks like { param: 'name', msg: 'Name is required', value: '' }
  if (errors) {
    res.render('register', { errors });
  }
  else {
    var newUser = new User({ name, email, username, password });

    User.createUser(newUser, function (err, user) {
      if (err) {
        req.flash('error_msg', err.errmsg);
        res.redirect('register');
        return;
      }
      req.flash('success_msg', 'You are registered and can now log in');
      res.redirect('/users/login/');
    });
  }
});

// Local Strategy code from passport documentation
passport.use(new LocalStrategy(
  function(username, password, done) {
    User.getUserByUsername(username, function(err, user) { // We defined this in the model
      if (err) throw err;
      if (!user) {
        return done(null, false, {message: 'Unknown User'});
      }

      // If the user exists, move on to password
      User.comparePassword(password, user.password, function(err, isMatch) {
        if (err) throw err;
        if (isMatch) {
          return done(null, user);
        }
        else {
          return done(null, false, {message: 'Invalid passwrod'});
        }
      });
    });
  }
));

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  // By default, this is findById, but I kept all DB queries in our model and used hte User middleman method
  User.getUserById(id, function(err, user) {
    done(err, user);
  });
});

// POST to login
router.post('/login',
  // When we receive POST to login, authenticate with local strategy
  // If it succeeds, send to index, if failure, send to login page with flash message
  passport.authenticate('local', {successRedirect: '/', failureRedirect: '/users/login', failureFlash: true}),
  function(req, res) {
    res.redirect('/');
  });

// GET to logout
router.get('/logout', function(req, res) {
  req.logout();
  req.flash('success_msg', 'You are logged out');
  res.redirect('/users/login');
});

module.exports = router;