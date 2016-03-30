var express = require('express');
var router = express.Router();
var db = require('../lib/db.js');

// edit user
router.get('/', function(req, res, next){
  var query = "SELECT name, link FROM molecules";
  db.query({text: query}. function (err, results) {
    if (err) {
      next(err);
      return;
    }
    
  });
});

router.post('/', auth, function(req, res, next))
module.exports = router;
