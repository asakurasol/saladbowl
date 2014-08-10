var db = require('./database');

/*create an object for game with the following properties

Number of Players
Player Names
Time Allowed Per Round
Total Number of words
Current word

Methods for updating the variables and writing them to database

Should export constructor method
*/

//create constructor
var SaladBowlGame = function(name){
	this.name = name;
}

SaladBowlGame.prototype.numberOfPlayers = 0;
SaladBowlGame.prototype.players = [];
SaladBowlGame.prototype.timePerRound = 60;
SaladBowlGame.prototype.wordpoolMax = 10;
SaladBowlGame.prototype.wordCount = 0;
SaladBowlGame.prototype.teamOnePlayer = 0;
SaladBowlGame.prototype.teamTwoPlayer = 0;

SaladBowlGame.prototype.addWordCount = function(){
	this.wordCount++;
}

SaladBowlGame.prototype.getWordCount = function(){
	return this.wordCount;
}

SaladBowlGame.prototype.addWord = function(user, msg, callback){						
	    								try{
										  if(this.wordCount >= this.wordpoolMax) throw "max reached";
										  //add a check for null values
										  //add a check for duplicates
										  //check to see if it starts with the right letter
										  else {
										  	  //refactor below for a method or pass in a json object
										      var msgJson = {
										        "user" : user,
										        "msg" : msg
										      };
										      this.addWordCount();
										      db.gameData.wordpool.save(msgJson);
										      return callback('', this.wordCount, this.wordCount == this.wordpoolMax);									  	
										  }
										}
										catch(err){
											callback(err)
										}
									};




module.exports = SaladBowlGame;
