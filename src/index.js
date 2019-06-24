'use strict';

// load modules
const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');
var session = require('express-session');
var routes = require('./routes');
const app = express();

// use session for tracking logins
app.use(session({
  secret: 'javascript rocks!',
  resave: true,
  saveUninitialized: false
}));

// make user ID available program wide
app.use(function(req, res, next){
  res.locals.currentUser = req.session.userId;
  next();
})

// MongoDB connection
mongoose.connect("mongodb://localhost:27017/course-api", {useNewUrlParser: true, 'useCreateIndex': true});
var db = mongoose.connection;

// Throw error if connection unsuccessful
db.on('error', function(err){
  console.error('There was a connection error: ', err);
});

// Successful connection notice
db.once('open', function(err){
  console.log("db connection successful");
});

app.use(express.json());

// set our port
app.set('port', process.env.PORT || 5000);

// morgan gives us http request logging
app.use(morgan('dev'));

// TODO add additional routes here

// send a friendly greeting for the root route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to the Course Review API'
  });
});

// ADD ROUTES
app.use('/api', routes);

// uncomment this route in order to test the global error handler
  app.get('/error', function (req, res) {
   throw new Error('Test error');
 });

// send 404 if no other route matched
app.use((req, res) => {
  res.status(404).json({
    message: 'Route Not Found'
  })
})

// global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message,
    error: {}
  });
});

// start listening on our port
const server = app.listen(app.get('port'), () => {
  console.log(`Express server is listening on port ${server.address().port}`);
});
