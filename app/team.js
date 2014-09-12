//create constructor
var Team = function(teamId){
	this.teamId = teamId,
	this.players = [];
	this.currentPlayer;
}

Team.prototype.add = function(playerObj){
	this.players.push(playerObj);
	//if this is the first add, set that player as the current player
	if(this.players.length == 1){
		this.currentPlayer = this.players[0];
	}
}

Team.prototype.get = function(index){
	return this.players[index];
}

Team.prototype.getLen = function(){
	return this.players.length;
}

function objectIndexOf(myArray, searchTerm, property) {
    for(var i = 0, len = myArray.length; i < len; i++) {
        if (myArray[i][property] === searchTerm) return i;
    }
    return -1;
}

//next function takes in a player object and return the next player object
Team.prototype.next = function(callback){
	var index = objectIndexOf(this.players, this.currentPlayer.username, 'username');
	index = (index+1)%(this.players.length);
	this.currentPlayer = this.players[index];
	return this.currentPlayer;
}


module.exports = Team;
