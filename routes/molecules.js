var express = require('express');
var router = express.Router();

// edit user
router.get('/', auth, function(req, res, next){
  var name = req.body.name;
  if(name){
    res.send({success: true, message: "You just made a successful request!"});
  }
});
