//create constructor
var Word = function(creator, content){
	this.content = content;
	this.creator = creator;
	this.sendTime = 0;
	this.returnTime = 0;
	this.roundOneTime = 0;
	this.roundTwoTime = 0;
	this.roundThreeTime = 0;
}

module.exports = Word;
