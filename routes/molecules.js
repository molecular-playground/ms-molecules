var express = require('express');
var router = express.Router();
var db = require('../lib/db.js');
var MS_HOSTING_URL = 'http://mshosting:3000/';

// edit user
router.get('/', function(req, res, next){
  var query = "SELECT name, link FROM Molecules";
  db.query({text: query}, function (err, results) {
    if (err) {
      next(err);
      return;
    }
    else {
      var moleculeEntries = results.rows;
      var moleculesWithURL = []
      for (molecule of moleculeEntries) {
        molecule.link = MS_HOSTING_URL + molecule.link;
        moleculesWithURL.push(molecule);
      }
      res.send({success: true, message: moleculesWithURL});
    }
  });
});

module.exports = router;
