'use strict';

var mongoose = require('mongoose');
var bcrypt = require('bcrypt');

//var Schema = mongoose.Schema;

var UserSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true
  },
  emailAddress: {
    type: String,
    required: true,
    unique: true
  },
  password : {
    type: String,
    required: true,
  }
});

// authenticate input against database
UserSchema.statics.authenticate = function(emailAddress, password, callback) {
  User.findOne({ emailAddress: emailAddress })
    .exec(function (error, user) {
      if(error) {
        return callback(error);
      } else if ( !user ) {
        var err = new Error('User not found.');
        err.status = 401;
        return callback(err);
      }
      bcrypt.compare(password, user.password, function(error, result) {
        if (result === true) {
          return callback(null, user);
        } else {
          return callback();
        }
      });
    });
}


var ReviewSchema = new mongoose.Schema({
  user: {
  type: mongoose.Schema.Types.ObjectId,
  ref: 'User'
  },
  postedOn: {
    type: Date,
    default: Date.now
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  review: { type: String }
});

var CourseSchema = new mongoose.Schema({
  user: {
  type: mongoose.Schema.Types.ObjectId,
  ref: 'User'
  },
  title: {
    type: String,
    required: true,
  },
  description : {
    type: String,
    required: true,
  },
  estimatedTime : String,
  materialsNeeded: String,
  steps: [{
    stepNumber: Number,
    title: { type: String, required: true},
    description: { type: String, required: true},
  }],
  reviews: [{
    type: mongoose.Schema.Types.ObjectId,
    required: false
  }]
});

CourseSchema.method("update", function(updates, callback){
  Object.assign(this, updates);
  this.save(callback);
});

// hash password before saving to database
UserSchema.pre('save', function(next){
  var user = this;
  bcrypt.hash(user.password, 10, function(err, hash){
    if(err){
      return next(err);
    }
    user.password = hash;
    next();
  })
});

// Create the models
var User = mongoose.model("User", UserSchema);
var Review = mongoose.model("Review", ReviewSchema);
var Course = mongoose.model("Course", CourseSchema);


module.exports.User = User;
module.exports.Review = Review;
module.exports.Course = Course;
