const auth = require('basic-auth');
var User = require('./models').User;

function requiresLogin(req, res, next) {
  const credentials = auth(req);
  if (credentials){
    User.authenticate(credentials.name, credentials.pass, function(error, user){
      if (error || !user){
        var err = new Error("Please enter the correct email and password to log in.");
        err.status = 401;
        return next(err);
      }else{
        req.activeUser = user;
        return next();
      }
    });
  }else{
    var err = new Error("You must be logged in to view this page.");
    err.status = 401;
    return next(err);
  }
}

module.exports.requiresLogin = requiresLogin;
