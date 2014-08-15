var db = require('./database');
var Player = require('./player'); //make a player object that tracks player stats
var Team = require('./team');
var Word = require('./word');

var SaladBowlGame = function(name){
	this.name = name;
	this.players = [];
	this.team1 = new Team('team1');
	this.team2 = new Team('team2');
	this.randomAssignTeam = true;
	this.wordpool = [];
	this.wordpoolMax = 10;
	this.wordCount = 0;
	this.timePerRound = 60;

//variable for when game is active
	this.currentRound = 0;
	this.currentPool = [];
	this.currentTeam = this.team2;
	this.currentPlayer = '';

//variables to send to player
	this.timeRemaining = 0;

}

SaladBowlGame.prototype.addToPool = function(word){
	this.wordpool.push(word);
	this.wordCount++;
}

SaladBowlGame.prototype.getWordCount = function(){
	return this.wordCount;
}

SaladBowlGame.prototype.getCurrentPlayer = function(){
	return this.currentPlayer;
}

SaladBowlGame.prototype.teamDecider = function(callback){
	var result;
	if(this.team1.getLen() <= this.team2.getLen()) {result = "team1"}
	else {result = "team2"};
	callback(result);
}

SaladBowlGame.prototype.createPlayer = function(username, socketId, callback){
	var self = this;
	this.teamDecider(function(team){
		var newPlayer = new Player(username, socketId, team);
		self.players.push(newPlayer);
		self[team].add(newPlayer);
	})
}


SaladBowlGame.prototype.resetTime = function(){
	this.timeRemaining = this.timePerRound;
}		

SaladBowlGame.prototype.firstRound = function(callback){
	//set current player to be the first player of each team
	this.currentPlayer = this.team2.currentPlayer;	
	return this.nextRound(callback);
}

//add a next round function
SaladBowlGame.prototype.nextRound = function(callback){
	this.currentRound++;
	this.currentPool = this.wordpool.slice();
	this.switchTeam();	
	return callback(this.loadGame());
}

SaladBowlGame.prototype.switchTeam = function(){
	this.resetTime();
	if(this.currentTeam == this.team1){
		this.currentTeam = this.team2;
		this.currentPlayer = this.team2.currentPlayer;
	}
	else{
		this.currentTeam = this.team1;
		this.currentPlayer = this.team1.currentPlayer;		
	}
}


//outputs a jsonified of current state of the game
SaladBowlGame.prototype.loadGame = function(){

	var result = {
		"currentRound" : this.currentRound,
		"currentTeam" : this.currentTeam,
		"timeRemaining" : this.timeRemaining
	}
	return JSON.stringify(result);
}

SaladBowlGame.prototype.addWord = function(user, word, callback){						
	    								try{
										  if(this.wordCount >= this.wordpoolMax) throw "max reached";
										  //add a check for null values - on client side
										  //add a check for duplicates (should we check for plural as well?)
										  //check to see if it starts with the right letter - on client side
						
										      /*db.gameData.wordpool.save(msgJson);*/
										  else {
									
										  	  var word = new Word(user, word);
										  	  this.addToPool(word);
										      return callback('', this.wordCount, this.wordCount == this.wordpoolMax);									  	
										  }
										}
										catch(err){
											callback(err)
										}
									};

//if there are no words, should trigger the next round
SaladBowlGame.prototype.pullWord = function(callback){
	var len = this.currentPool.length;
	if(len == 0) {return callback(true);} //let socket known that we are out of words
	else{
		var rand = Math.floor(Math.random()*len);
		var result = this.currentPool[rand];
		this.currentPool.splice(rand,1)
		return callback('',result);
	}
}

SaladBowlGame.prototype.pushWord = function(word){
	this.currentPool.push(word)
}

SaladBowlGame.prototype.nextPlayer = function(switching){
	this.currentPlayer = this.currentTeam.next();
	if(switching){this.switchTeam()}
}

module.exports = SaladBowlGame;