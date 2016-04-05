var express = require('express');
var router = express.Router();
var db = require('../lib/db.js');
var MS_HOSTING_URL = 'http://mshosting:3000/';

// get the list of all molecules
router.get('/', function(req, res, next) {
  var query = "SELECT mid, name, link FROM Molecules";
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
// Gets the molecules from the database
// whose name is "like" the one passed to this route.
router.get('/:name', function(req, res, next) {
  var name = req.params.name;
  var query = 'SELECT * FROM molecules WHERE name LIKE '$1'';
  db.query({text: query, values: ['%name%']}, function(err, results) {
    if (err) {
      next(err);
      return;
    }
    // Return the molecules that have matched.
    var molecules = [];
    for (molecule of results.rows) {
      molecule.link = MS_HOSTING_URL + molecule.link;
      molecules.push(molecule);
    }
    res.send({success: true, message: molecules});
  });
});

module.exports = router;
