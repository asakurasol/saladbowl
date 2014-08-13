var db = require('./database');
var Player = require('./player'); //make a player object that tracks player stats
var Word = require('./word');

var SaladBowlGame = function(name){
	this.name = name;
}

//update this as players join the room
SaladBowlGame.prototype.numberOfPlayers = 0;

//Variables for game settings/options
SaladBowlGame.prototype.players = [];
SaladBowlGame.prototype.team1 = [];
SaladBowlGame.prototype.team2 = [];
SaladBowlGame.prototype.randomAssignTeam = true;
SaladBowlGame.prototype.wordpool = [];
SaladBowlGame.prototype.wordpoolMax = 10;
SaladBowlGame.prototype.wordCount = 0;
SaladBowlGame.prototype.timePerRound = 60;

//variable for when game is active
SaladBowlGame.prototype.currentRound = 0;
SaladBowlGame.prototype.currentPool = [];
SaladBowlGame.prototype.currentTeam = '';
SaladBowlGame.prototype.currentPlayer = '';
SaladBowlGame.prototype.team1CurrentPlayer = '';
SaladBowlGame.prototype.team2CurrentPlayer = '';

//variables to send to player
SaladBowlGame.prototype.timeRemaining = 0;

SaladBowlGame.prototype.addToPool = function(word){
	this.wordpool.push(word);
	this.wordCount++;
	console.log(this.wordpool);
}

SaladBowlGame.prototype.getWordCount = function(){
	return this.wordCount;
}

SaladBowlGame.prototype.getCurrentPlayer = function(){
	return this.currentPlayer;
}

SaladBowlGame.prototype.teamDecider = function(){
	if(this.team1.length >= this.team2.length) return 1;
	else return 2;
}

SaladBowlGame.prototype.createPlayer = function(username, socketId, callback){
	var team
	this.players.push(new Player(username, socketId, this.teamDecider()));
}

SaladBowlGame.prototype.resetTime = function(){
	this.timeRemaining = timePerRound;
}		

SaladBowlGame.prototype.firstRound = function(){
	//team 2 starts, but it's actually switched 
	this.currentTeam = 2;
	//set current player to be the first player of each team
	this.currentPlayer = team2[0];
	this.team1CurrentPlayer = team1[0];
	this.team2CurrentPlayer = team2[0];	
	return this.nextRound();
}

//add a next round function
SaladBowlGame.prototype.nextRound = function(){
	this.round++;
	this.currentPool = this.wordpool.slice();
	this.switchTeam();	
	return this.loadGame();
}

SaladBowlGame.prototype.switchTeam = function(){
	if(this.currentTeam == 1){
		this.currentTeam == 2;
		this.currentPlayer = this.Team2CurrentPlayer;
	}
	else{
		this.currentTeam == 1;
		this.currentPlayer = this.Team1CurrentPlayer;				
	}
	return this.currentPlayer;
}


//outputs a jsonified of current state of the game
SaladBowlGame.prototype.loadGame = function(){
	var result //= jsonify{};
	return result;
}

SaladBowlGame.prototype.addWord = function(user, word, callback){						
	    								try{
										  if(this.wordCount >= this.wordpoolMax) throw "max reached";
										  //add a check for null values - on client side
										  //add a check for duplicates (should we check for plural as well?)
										  //check to see if it starts with the right letter - on client side
										      /*var msgJson = {
										        "user" : user,
										        "word" : word
										      };
										      this.addToPool(word);
										      db.gameData.wordpool.save(msgJson);*/
										  else {
										  	  //refactor below for a method or pass in a json object
										  	  var word = word.toLowerCase(); //use regex to remove special characters - on client side
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
	if(len == 0) return callback(true) //let socket known that we are out of words
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

/*TESTS*/
var test = new SaladBowlGame('test');
console.log(test);

for(var i = 0; i <11; i++){
	test.addWord('a', 'b'+i, function(a,b,c){console.log(a,b,c)});
}

test.nextRound();

for(var i = 0; i <11; i++){
	test.pullWord(function(a,b){console.log(a,b)});
}

module.exports = SaladBowlGame;
