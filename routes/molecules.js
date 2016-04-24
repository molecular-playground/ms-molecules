var express = require('express');
var router = express.Router();
var db = require('../lib/db.js');
var fs = require('fs');
var authadmin = require('../lib/authadmin.js');
var SERVER_URL = process.env.SERVER_URL;
var HOSTING_URL = 'http://' + SERVER_URL + ':8000/api/molecules/files/';

var multer = require('multer');
var uploading = multer({
  dest: 'public/'
});

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
        molecule.link = HOSTING_URL + molecule.link;
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
    /* Go through each molecule and prepend
     * the beginning of the URL to it.
     * The expected value that
     * `molecule.link` holds is a FILENAME,
     * NOT A URL.
     */
    var moleculesWithURL = [];
    for (molecule of results.rows) {
      molecule.link = HOSTING_URL + molecule.link;
      moleculesWithURL.push(molecule);
    }
    res.send({success: true, message: moleculesWithURL});
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
        filename = name +'.' + type;
        var query = "INSERT INTO molecules(name, link, data_type) VALUES($1, $2, $3)";
        db.query({text: query, values: [name,filename,type]}, function(err, results) {
          if(err) {
            next(err);
          } else {
            res.send({success: true, message: filename});
          }
        });
      }
    });
  }
  else {
    next();
  }
});

//delete molecule route
router.delete('/', authadmin, function(req,res,next){
  var name = req.body.name;
  var query = "DELETE FROM molecules WHERE name = $1 RETURNING filename";
  db.query({text: query, values: [name]}, function(err, results) {
    if(err) next(err);
    else if(results.rows.length < 1) {
      var err = new Error('Not Found');
      err.status = 404;
      next(err);
    }
    else{
      fs.unlink('public/' + results.rows[0].filename);
      res.send({success: true});
    }
  });

});

module.exports = router;
