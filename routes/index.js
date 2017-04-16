var express = require('express');
var router = express.Router();

// Access Poll model for getting user's polls
var Poll = require('../models/poll');

// Get the home page
// ensureAuthenticated is middleware added in as argument
router.get('/', ensureAuthenticated, function(req, res) {
  Poll.getPollsByUsername(req.user.username, function(err, polls) {
    res.render('index', { polls });
  })
});

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  else {
    req.flash('error_msg', 'You are not logged in');
    res.redirect('/users/login');
  }
}

module.exports = router;