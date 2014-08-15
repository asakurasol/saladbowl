//create constructor
var Player = function(username, socketId, team){
	this.username = username;
	this.team = team;
	this.id = socketId
}

module.exports = Player;
