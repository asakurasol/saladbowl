var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'Salad Bowl' });
});

router.get('/gameroom', function(req, res) {
  res.render('gameroom', { gameRoom: 'Game Room #34' });
});


module.exports = router;
