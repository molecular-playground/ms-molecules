var express = require('express');
var router = express.Router();
var db = require('../lib/db.js');

var multer = require('multer');
var uploading = multer({
  dest: 'public/'
});

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
      for (var molecule of results.rows) {
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
  var query = "SELECT * FROM molecules WHERE name LIKE $1";
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

//serve static files
router.get('/files/',express.static('public'));

//upload static files
router.post('/upload',uploading.single('upl'), function(req,res,next){
  if(req.file){
    var name = req.query.name;
    var filename = req.file.filename;
    var type = req.query.type;
    var query = "INSERT INTO molecules(name, link, data_type) VALUES($1, $2, $3)";
    db.query({text: query, values: [name,filename,type]}, function(err, results) {
      if(err){
        next(err);
      }else res.send({success: true, message: req.file.filename});
    });
  }
  else {
    next();
  }
});

module.exports = router;
