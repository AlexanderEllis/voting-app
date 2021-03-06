var express = require('express');
var router = express.Router();
var passport = require('passport');
var Handlebars = require('handlebars');

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
    let ip = req.headers['x-forwarded-for'] || 
     req.connection.remoteAddress || 
     req.socket.remoteAddress ||
     req.connection.socket.remoteAddress;
    ip = ip.replace(/[:a-x]/g, '');
    Poll.checkIfAlreadyVoted(poll.key, ip, function(err, voted) {
      res.render('poll', { 
        poll,
        voted, 
        url: req.protocol + '://' + req.get('host') + req.originalUrl,
        authenticated: req.isAuthenticated(),
        helpers: {
          plot: (options) => graphPoll(options) 
        }
      });
    })
  });
});

// POST to specific poll page, either vote or add option
router.post('/:poll', function(req, res) {
  let pollKey = req.params.poll;
  let option = req.body.option;
  let ip = req.headers['x-forwarded-for'] || 
    req.connection.remoteAddress || 
    req.socket.remoteAddress ||
    req.connection.socket.remoteAddress;
  ip = ip.replace(/[:a-x]/g, '');
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
});

// POST to /delete/:POLL
router.post('/delete/:poll', ensureAuthenticated, function(req, res) {
  let user = req.user['_doc'].username;
  let pollKey = req.params.poll;

  
  Poll.getPollByKey(pollKey, function(err, poll) {
    if (err) {
      req.flash('error_msg', err.errmsg);
      res.render('poll-not-found');
      return
    }
    else if (!poll) {
      res.render('poll-not-found');
      return
    }
    else {
      // Triple check, although the link is only visible for the owner on the dashboard
      if (poll.owner === user) {
        Poll.deletePoll(poll.key, function(err, success) {
          req.flash('success_msg', 'Poll successfully deleted');
          res.redirect('/');
        });
      }
    }
  });
})

router.get('/', function(req, res) {
  res.redirect('/');
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

function graphPoll(options) {
  let labels = [];
  let data = [];
  for (let i = 0; i < options.length; i++) {
    labels.push(JSON.stringify(options[i].name));
    data.push(options[i].votes);
  }
  return new Handlebars.SafeString(`
    <canvas id="myChart" width="400" height="200"></canvas>
    <script>
      var ctx = document.getElementById("myChart");
      var myChart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: [ ${labels} ],
          datasets: [{
            label: '# of Votes',
            data: [ ${data} ],
            backgroundColor: 'rgba(54, 162, 235, 0.4)',
            borderColor: 'rgba(54, 162, 235, 0.9)',
            borderWidth: 1
          }]
        },
        options: {
          scales: {
            yAxes: [{
              ticks: {
                beginAtZero: true,
                callback: function(value) {if (value % 1 === 0) {return value;}}
              }
            }]
          }
        }
      });
    </script>`
  )
}


module.exports = router;