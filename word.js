//create constructor
var Word = function(content, creator){
	this.content = content;
	this.creator = creator;
}

Word.prototype.roundOneTime = 0;
Word.prototype.roundTwoTime = 0;
Word.prototype.roundThreeTime = 0;

module.exports = Word;
