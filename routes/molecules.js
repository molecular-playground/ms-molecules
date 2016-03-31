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
      /* Go through each molecule and prepend
       * the beginning of the URL to it.
       * The expected value that
       * `molecule.link` holds is a FILENAME,
       * NOT A URL.
       */
      var moleculesWithURL = []
      for (molecule of results.rows) {
        molecule.link = MS_HOSTING_URL + molecule.link;
        moleculesWithURL.push(molecule);
      }
      res.send({success: true, message: moleculesWithURL});
    }
  });
});

module.exports = router;
