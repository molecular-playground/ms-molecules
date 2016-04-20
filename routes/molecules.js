var express = require('express');
var router = express.Router();
var db = require('../lib/db.js');
var fs = require('fs');
var authadmin = require('../lib/authadmin.js');
var multer = require('multer');
var uploading = multer({
  dest: 'public/'
});

var MS_HOSTING_URL = 'http://104.236.54.250:8000/api/molecule/files/';

// get the list of all molecules
router.get('/', function(req, res, next) {
  var query = "SELECT * FROM Molecules";
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

//upload static files
router.post('/upload', authadmin, uploading.single('molecule'), function(req,res,next) {
  if(req.file) {
    var name = req.body.name;
    var filename = req.file.filename;
    var type = req.body.type;
    fs.rename('public/' + filename, 'public/' + name + '.' + type, function(err){
      if(err) next(err);
      else{
        filename = name;
        var query = "INSERT INTO molecules(name, link, data_type) VALUES($1, $2, $3)";
        db.query({text: query, values: [name,filename,type]}, function(err, results) {
          if(err) {
            next(err);
          } else {
            res.send({success: true, message: req.file.filename});
          }
        });
      }
    });
  }
  else {
    next();
  }
});

module.exports = router;
