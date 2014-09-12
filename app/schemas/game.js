var mongoose = require('mongoose');
var gameSchema;
var Game;
var Team = require('../team');
var SB = require('../game');
var Player = require('../player')
var Word = require('../word');


gameSchema = new mongoose.Schema({
		id : String,
		roomName : String,
		players : Array,
		team1 : Object,
		team2 : Object,
		team1Score : Number,
		team2Score : Number,
		randomAssignTeam : Boolean,
		wordpool : Array,
		wordpoolMax : Number,
		wordCount : Number,
		timePerRound : Number,
		currentRound : Number,
		currentPool : Array,
		currentTeam : Object,
		currentPlayer : Object,
		timeRemaining : Number
	},{collection: 'games'});

gameSchema.set('versionKey', false);

gameSchema.statics.findByRoom = function (id, callback) {
	this.findOne({"_id" : id})
		.exec(function(err, Game){
		if(err){
			return callback(err);
		}
		return callback('', Game);
	})
};

gameSchema.statics.teamDecider = function(team1, team2){
	var result;
	if(team1.players.length <= team2.players.length) {result = "team1"}
	else {result = "team2"};
	return result;
};

gameSchema.statics.createPlayer = function(id, username, socketId, callback){
	var self = this;
	this.findByRoom(id, function(err, game){
		if(err){
			callback(err);
		}
		else {
			var team = self.teamDecider(game.team1, game.team2);
			var newPlayer = new Player(username, socketId, team);
			game.players.push(newPlayer);
		    game.markModified('players');
			game[team].__proto__ = Team.prototype;
			game[team].add(newPlayer);
		    game.markModified(team);
		    game.save(); 
			//add error handling
			return callback('', [game.team1, game.team2]);
		};
	})
}

gameSchema.statics.addWord = function(id, user, content, callback){	
	var self = this;
	this.findByRoom(id, function(err, game){					
		try{
		  if(game.wordCount >= game.wordpoolMax) throw "max reached";
		  else {

		  	  var word = new Word(user, content);
			  game.wordpool.push(word);
			  game.markModified('wordpool');
			  game.wordCount++;
			  game.save();
		      return callback('', game, game.wordCount, game.wordCount === game.wordpoolMax);									  	
		  }
		}
		catch(err){
			callback(err)
		};
	});
};

gameSchema.statics.firstRound = function(game, callback){

		game.currentPlayer = game.team2.currentPlayer;	
		game.markModified('currentPlayer');

		game.currentRound++;
		game.markModified('currentRound');
		game.currentPool = game.wordpool.slice();
		game.markModified('currentPool');
		game.timeRemaining = game.timePerRound;
		if(game.currentTeam === game.team1){
			game.currentTeam = game.team2;
			game.currentPlayer = game.team2.currentPlayer;
		}
		else{
			game.currentTeam = game.team1;
			game.currentPlayer = game.team1.currentPlayer;		
		}
		game.markModified('currentTeam');
		/*return callback(Object.keys(game));*/
		game.save(function(err, data){
			if(err){return callback(err)}
			else {
					var result = {
						"currentRound" : game.currentRound,
						"currentTeam" : game.currentTeam,
						"timeRemaining" : game.timeRemaining
					}
					return callback('', game, JSON.stringify(result));
			}
	})
};

gameSchema.statics.nextRound = function(game, callback){

		game.currentRound++;
		game.markModified('currentRound');
		game.currentPool = game.wordpool.slice();
		game.markModified('currentPool');
		game.timeRemaining = game.timePerRound;
		if(game.currentTeam === game.team1){
			game.currentTeam = game.team2;
			game.currentPlayer = game.team2.currentPlayer;
		}
		else{
			game.currentTeam = game.team1;
			game.currentPlayer = game.team1.currentPlayer;		
		}
		game.markModified('currentTeam');
		/*return callback(Object.keys(game));*/
		game.save(function(err, data){
			if(err){return callback(err)}
			else {
					var result = {
						"currentRound" : game.currentRound,
						"currentTeam" : game.currentTeam,
						"timeRemaining" : game.timeRemaining
					}
					return callback('', game, JSON.stringify(result));
			}
	})
};

gameSchema.statics.pullWord = function(game, callback){
		var len = game.currentPool.length;				
		if(len == 0) {return callback(true);} //let socket known that we are out of words
		else{
			var rand = Math.floor(Math.random()*len);
			var result = game.currentPool[rand];
			result.sendTime = game.timeRemaining;
			game.currentPool.splice(rand,1)
			game.markModified('currentPool');
			game.save();
			return callback('',result, game.currentPlayer.socketId);
		}
}

gameSchema.statics.pushWord = function(id, correct, phrase, callback){
	var self = this;
	this.findByRoom(id, function(err, game){
			if(!correct){
				game.currentPool.set(game.currentPool.length, phrase);
			}
			else{
				if (game.currentTeam.teamId === 'team1'){
					game.team1Score++;
				} 
				else {
					game.team2Score++;
				}
			};
			var scores = {
					team1: game.team1Score,
					team2: game.team2Score
				};
			game.save(function(err, savedGame){
				return callback(err, scores, savedGame);
			});
		})
};

gameSchema.statics.addScore = function(id, callback){
	var self = this;
	this.findByRoom(id, function(err, game){	
			if (game.currentTeam.teamId === 'team1'){
				game.team1Score++;
			} 
			else {
				game.team2Score++;
			}
			game.save(function(err, game){
				return callback(err, {
					team1: game.team1Score,
					team2: game.team2Score
				})		
			});
		})
};

gameSchema.statics.updateTime = function(game, timeRemaining, callback){			
	game.timeRemaining = timeRemaining;
	game.save();
	callback(game);
};

gameSchema.statics.nextPlayer = function(game, correct, switching, callback){	
	game.currentTeam.__proto__ = Team.prototype;

	if(correct){
		game.currentPlayer = game.currentTeam.next();
		game[game.currentTeam.teamId] = game.currentTeam;
		game.markModified(game.currentTeam.teamId);
	};

	if(switching)
	{
		game.timeRemaining = game.timePerRound;
		if(game.currentTeam.teamId === 'team1'){
			game.currentTeam = game.team2;
			game.currentPlayer = game.team2.currentPlayer;
		}
		else{
			game.currentTeam = game.team1;
			game.currentPlayer = game.team1.currentPlayer;		
		}
	};

	game.markModified('currentPlayer');
	game.markModified('currentTeam');
	game.save();
	callback(game);
};

Game = mongoose.model('Game', gameSchema);

module.exports = Game;
