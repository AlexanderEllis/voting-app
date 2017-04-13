var mongoose = require('mongoose');
var bcrypt = require('bcryptjs'); // Used for password hashing

var UserSchema = mongoose.Schema({
  username: {
    type: String,
    index: true,
    unique: true
  },
  password: {
    type: String
  },
  email: {
    type: String
  },
  name: {
    type: String
  }
});

// Create variable that we're able to access outside of the file
var User = module.exports = mongoose.model('User', UserSchema);

// Define function for hashing password.  Used in POST to register
module.exports.createUser = function(newUser, callback) {
  bcrypt.genSalt(10, function(err, salt) { // Generate the salt
    bcrypt.hash(newUser.password, salt, function(err, hash) { // Hash the password
      newUser.password = hash;  // Reassign newUser.password to be the hashed value
      newUser.save(callback);
    });
  });
}

// Define function for finding user from username.  Used in POST to login
module.exports.getUserByUsername = function(username, callback) {
  var query = { username };
  User.findOne(query, callback);
}

module.exports.getUserById = function(id, callback) {
  User.findById(id, callback);
}

// We can let bcrypt handle the password comparison, since it knows how to access the salt
module.exports.comparePassword = function(candidatePassword, hash, callback) {
  bcrypt.compare(candidatePassword, hash, function(err, isMatch) {
    if (err) throw err;
    callback(null, isMatch);
  });
}