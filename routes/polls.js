var express = require('express');
var router = express.Router();
var passport = require('passport');

var User = require('../models/user');
var Poll = require('../models/poll');

// GET to new poll page
router.get('/new', ensureAuthenticated, function(req, res) {
  res.render('new-poll');
});

// PUT to new page
router.post('/new', ensureAuthenticated, function(req, res) {
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
    let newKey = Math.random().toString(36).substr(2, 5); 

    var newPoll = new Poll({ key: newKey, owner: req.user['_doc'].username, name, options: options });

    Poll.createPoll(newPoll, function(err, poll) {
      if (err) {
        req.flash('error_msg', err.errmsg);
        res.redirect('polls/new');
      }
      req.flash('success_msg', 'Poll created!');
      res.redirect('/polls/' + newKey);
    })
  }
});

// GET to specific poll page
router.get('/:poll', function(req, res) {
  Poll.getPollByKey(req.params.poll, function(err, poll) {
    if (err) {
      req.flash('error_msg', err.errmsg);
      res.render('poll-not-found');
      return
    }
    else if (!poll) {
      res.render('poll-not-found');
      return
    }
    let ip = req.connection.remoteAddress.replace(/[:a-x]/g, '');
    Poll.checkIfAlreadyVoted(poll.key, ip, function(err, voted) {
      res.render('poll', { poll, voted });
    })
  });
});

// POST to specific poll page
router.post('/:poll', function(req, res) {
  let pollKey = req.params.poll;
  let option = req.body.option;
  let ip = req.connection.remoteAddress.replace(/[:a-x]/g, '');
  // If option is addOption and not blank, add option with 1 vote
  // Otherwise add vote to option
  if (option === 'addOption') {
    let newOption = req.body.newOption;
    if (newOption === '') {
      req.flash('error_msg', 'Please include your new option');
      res.redirect(pollKey);
    }
    else {
      Poll.addOption(pollKey, newOption, ip, function(err, poll) {
        req.flash('success_msg', 'You have successfully added your option!');
        res.redirect(poll.key);
      })
    }
  }
  else {
    Poll.vote(pollKey, option, ip, function(err, poll) {
      if (err) throw err;

      req.flash('success_msg', 'You have successfully voted!');
      res.redirect(poll.key);
    })
  }
  // TODO: Handle vote
  // TODO: Handle new choice
});

// TODO: Delete /:POLL
// Ensure authenticated, ensure owner

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