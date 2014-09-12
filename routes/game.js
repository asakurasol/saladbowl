var express = require('express');
var mongoose = require('mongoose');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res) {
  res.send('respond with a new game source');
});

router.post('/', function (req, res) {

    // show the request body in the command line
    console.log(req.body);

    // return a json response to angular
    res.json({
        'msg': 'success!'
    });
});


module.exports = router;
