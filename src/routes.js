'use strict';

const express = require('express');
const router = express.Router();
var mid = require('./middleware');
const auth = require('basic-auth');
const bcryptjs = require('bcryptjs');

var User = require('./models').User;
var Course = require('./models').Course;
var Review = require('./models').Review;

//Handler for /:id routes
router.param("id", function(req, res, next, id){
  Course.findById(id, function(err, doc){
    if(err) return next(err);
    if(!doc){
      err = new Error("Course Not Found");
      err.status = 404;
      return next(err);
    }
    req.course = doc;
    return next();
  });
});

//GET /api/users 200
router.get('/users', mid.requiresLogin, function(req, res, next){
  res.status(200);
  return res.send({
    _id: req.activeUser._id,
    fullName: req.activeUser.fullName,
    emailAddress: req.activeUser.emailAddress,
    password: req.activeUser.password,
    __v: req.activeUser.__v
  });
});

// POST /api/users 201
router.post('/users', function(req, res, next){
  var user = new User(req.body);
  user.save(function(err, question){
    if(err) {
      err.status = 400;
      return next(err);
    }
    res.status(201);
    //res.json(user);
    res.location('/');
    res.end();
  });

  //res.send("hello from post/api/users");
});

// GET /api/courses 200
router.get('/courses', function(req, res){
  Course.find({}, {title: 1}).exec(function(err, courses){
    if(err) return next(err);
    res.json(courses);
  });
});

// GET course
router.get('/courses/:id', function(req, res, next){
  Course.findById(req.params.id)
    .populate({path: 'user', select: 'fullName'})
    .populate({path: 'reviews'})
    .exec(function(err, course){
      if(!course){
        return next(new Error("Course not found."));
      }
      if(err) return next(err);
      res.status(200)
      res.json(course);
      //res.end();
    });

});

// POST /api/courses 201
router.post('/courses',  mid.requiresLogin, function (req, res, next) {
  var course = new Course(req.body);
  course.save(function(err, question){
    if(err) {
      err.status = 400;
      return next(err);
    }
    res.status(201);
    res.location('/');
    res.end();
    //res.json(course);
    //return res.redirect('/');
  });
});

// PUT /api/courses/:courseId 204
router.put('/courses/:id',  mid.requiresLogin, function(req, res, next){
  req.course.update(req.body, function(err, result){
    if(err) {
      err.status = 400;
      return next(err);
    }
    //res.json(result);
    res.status(201);
    res.end();
    //return res.redirect('/');
  });
});

router.post('/courses/:id/reviews',  mid.requiresLogin, function(req, res, next){
  const review = new Review(req.body);
  review.save(function(err){
    if(err){
      err.status = 400;
      return next(err);
    }
    Course.findById(req.params.id).exec(function(err,course){
      if(err) return next(err);
      course.reviews.push(review);
      course.save(function(err){
        if(err){
          err.status = 400;
          return next(err);
        }
        res.location('/courses/' + req.params.id);
        //res.json(review);
        res.status(201);
        res.end();
      });
    });
  });
});


module.exports = router;
