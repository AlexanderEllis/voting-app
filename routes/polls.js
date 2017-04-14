var express = require('express');
var router = express.Router();

var Poll = require('../models/poll');

// GET to new poll page
router.get('/new', ensureAuthenticated, function(req, res) {
  res.render('new-poll');
});

// GET to specific poll page
router.get('/:poll', function(req, res) {
  Poll.getPollByKey(req.params.poll, function(err, poll) {
    if (err) {
      req.flash('error_msg', err.errmsg);
      res.render('poll-not-found');
      return
    }
    else if (poll === null) {
      res.render('poll-not-found');
      return
    }
    res.render('poll', { poll: req.params.poll });
  });
});

// POST to new page
router.post('/new', function(req, res) {

  // Access body as json with body-parser
  let name = req.body.name;
  let option1 = req.body.option1;

  // Create options array
  let options = [];

  for (let option in req.body) {
    if (option !== 'name' && req.body[option] !== '') {
      options.push( {
        name: req.body[option],
        votes: 0
      })
    }
  }

  // Add to body for express-validator
  req.body.options = options;

  // Generate random key by generating random number, base 36 (lots of letters) and substring it
  let newKey = Math.random().toString(36).substr(2, 5); 

  // TODO: validate newKey is unique

  // Validate name and options
  req.checkBody('name', 'Poll name is required').notEmpty();
  req.checkBody('options', 'At least one option is required').notEmpty();

  // Grab any errors
  let errors = req.validationErrors();

  // If there are any errors, we'll pass to new-poll
  if (errors) {
    res.render('new-poll', { errors });
  }
  else {
    // TODO: Add Poll to database
    res.render('poll', {poll: name});
  }
});

router.get('/', function(req, res) {
  res.render('poll-not-found');
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