var njwt = require('njwt');
var SIGNING_KEY = process.env.SIGNING_KEY;

var sendError = function(message, status, next) {
  var err = new Error(message);
  err.status = status;
  next(err);
}

// Accepted Header:
//    Authorization: Token YOUR_TOKEN_HERE
module.exports = function(req, res, next) {
  if(!req.headers.authorization) {
    // token not sent
    sendError("Token was not recieved.\nExpected token in 'Authorization' header with format: 'Token YOUR_TOKEN_HERE'", 401, next);
  } else {
    var authorizationArray = req.headers.authorization.split(' ');
    if(authorizationArray[0] === 'Token' && authorizationArray[1]) {
      njwt.verify(authorizationArray[1], SIGNING_KEY, function(err, ver) {
        if(err) {
          // token is expired
          sendError("Token is expired.", 401, next);
        } else if(!ver.body.admin){
          sendError("Must be admin to access route.", 403, next);
        } else{
          // token is Gucci!
          req.user = ver.body;
          next();
        }
      });
    } else {
      // token incorrect format
      sendError("Token is not in correct format.\nExpected: 'Token YOUR_TOKEN_HERE'", 401, next);
    }
  }
}
