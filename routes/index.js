var express = require('express');
var mongoose = require('mongoose');
var router = express.Router();
var Game = require('../app/schemas/game');
var Team = require ('../app/team');


/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'Express' });
});

router.get('/api/games', function(req, res) {

	// use mongoose to get all todos in the database
	Game.find(function(err, games) {

		// if there is an error retrieving, send the error. nothing after res.send(err) will execute
		if (err)
			res.send(err)

		res.json(games); // return all todos in JSON format
	});
});

router.post('/api/games', function(req, res) {

	var team1 = new Team('team1');
	var team2 = new Team('team2');
	// create a todo, information comes from AJAX request from Angular
	Game.create({
		roomName : req.body.text,
		team1: team1,
		team2: team2,
		team1Score: 0,
		team2Score: 0,
		wordpoolMax : 10,
		wordCount : 0,
		timePerRound : 60,
		currentRound : 0,
		done : false
	}, function(err, game) {
		if (err)
			res.send(err);

		// get and return all the todos after you create another
		Game.find(function(err, games) {
			if (err)
				res.send(err)
			res.json(games);
			console.log(games);
		});
	});

});

router.delete('/api/games/:game_id', function(req, res) {
	Game.remove({
		_id : req.params.game_id
	}, function(err, game) {
		if (err)
			res.send(err);

		// get and return all the todos after you create another
		Game.find(function(err, games) {
			if (err)
				res.send(err)
			res.json(games);
		});
	});
});

module.exports = router;
