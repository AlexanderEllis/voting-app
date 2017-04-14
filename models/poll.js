var mongoose = require('mongoose');

var PollSchema = mongoose.Schema({
  key: {
    type: String,
    index: true,
    unique: true,
  },
  owner: {
    type: String
  },
  name: {
    type: String
  },
  options: [{ name: String, votes: Number }],
  voted: [{identifier: Boolean}] // Identifier will be username or IP address
});

// Create variable we're able to access outside of file
var Poll = module.exports = mongoose.model('Poll', PollSchema);

// Define function for creating poll
module.exports.createPoll = function(newPoll, callback) {
  newPoll.save(callback)
}

// Define function for finding poll
module.exports.getPollByKey = function(key, callback) {
  var query = { key };
  Poll.findOne(query, callback);
}

// Vote function
module.exports.vote = function(key, option, identifier, callback) {
  var query = { key }
  Poll.findOne(query, function(err, poll) {
    if (err) throw err

    for (let i = 0; i < poll.options.length; i++) {
      if (poll.options[i].name == option) {
        poll.options[i] ++;
        break;
      }
    }

    poll.voted[identifier] = true;

    poll.save(callback);
  })
}

// Function for adding option to existing poll
module.exports.addOption = function(key, option, identifier, callback) {
  var query = { key };
  Poll.findOne(query, function(err, poll) {
    if (err) throw err;

    poll.options.push( { name: option, votes: 1 });
    poll.voted[identifier] = true;

    poll.save(callback);
  })
}

module.exports.deletePoll = function(key, callback) {
  var query = { key };
  Poll.deleteOne(query, callback);
}

module.exports.checkIfAlreadyVoted = function(key, identifier, callback) {
  var query = { key };
  Poll.findOne(query, function(err, poll) {
    if (err) throw err;

    callback(null, Boolean(poll.voted[identifier]));
  })
}