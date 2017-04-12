var express = require('express');
var router = express.Router();
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

// Allows us to access user mongoose model
var User = require('../models/user');

// Get the register page
router.get('/register', function(req, res) {
  res.render('register');
});

// Get the login page
router.get('/login', function(req, res) {
  res.render('login');
});

module.exports = router;