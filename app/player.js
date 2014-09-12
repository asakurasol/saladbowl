//create constructor
var Player = function(username, socketId, team){
	this.username = username;
	this.team = team;
	this.socketId = socketId
}

module.exports = Player;
