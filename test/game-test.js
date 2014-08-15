var chai = require('chai');

chai.config.includeStack =true;

global.expect = chai.expect;
global.AssertionError = chai.AssertionError;
global.Assertion = chai.Assertion;
global.assert = chai.assert;

var Game = require('../server/game');
var game = new Game("abcd")

describe('When creating a game object with a name', function(){

	it("it should have the name as one of its properties", function(){
		expect(game.name).to.equal("abcd")
	})
})

game.createPlayer("testPlayer1", "id1", function(){})
game.createPlayer("testPlayer2", "id2", function(){})
game.createPlayer("testPlayer3", "id3", function(){})
game.createPlayer("testPlayer4", "id4", function(){})

describe('when you add a player', function(){
	it("it should be added to player list", function(){
		expect(game.players[0].username).to.equal("testPlayer1")
	})

	it("first player should be added to team1", function(){
		expect(game.team1.get(0).username).to.equal("testPlayer1")
	})

	it("second player should be added to team2", function(){
		expect(game.team2.get(0).username).to.equal("testPlayer2")
	})
})

var max = game.wordpoolMax

for(var i = 0; i <max-1; i++){
	game.addWord('a', 'b'+i, function(a,b,c){});
}


describe("When you add words to the pool", function(){

	before(function(){
		it("the words should be in the pool", function(){
			expect(game.wordpool.length).to.equal(max-1)
		})
	})

	game.addWord('a','b10', function(err, wordCount, reachedMax){
		it("the 10th word should hit 10 for the word count", function(){
			expect(wordCount).to.equal(max)
		})	

		it("and it will trigger the 'max' event", function(){
			expect(reachedMax).to.equal(true)
		})	
	})

	game.addWord('a','b11', function(err, wordCount, reachedMax){
		it("adding words beyong max will trigger error", function(){
			expect(err).to.equal( "max reached")
		})	
	})
})

describe("when you start the game", function(done){

	var result;

	before(function(){
		game.firstRound(function(json){
			result = json;
		})
	})

		it("it should increase round count by one", function(){
			expect(game.currentRound).to.equal(1);
		})
		it("current team is team 1", function(){
			expect(game.currentTeam.teamId).to.equal("team1");
		})
		it("there exists a current player", function(){
			expect(game.currentPlayer).to.not.equal(undefined)
		})
		it("current player is the first player of team 1", function(){
			expect(game.currentPlayer).to.equal(game.team1.get(0))
		})
		it("returns a JSON object describing the current state of the game", function(){
			var obj = JSON.parse(result);
			expect(obj.currentRound).to.equal(game.currentRound);
			expect(obj.currentTeam.teamId).to.deep.equal(game.currentTeam.teamId);
			expect(obj.currentTeam.players).to.deep.equal(game.currentTeam.players);
			expect(obj.currentTeam.currentPlayer).to.deep.equal(game.currentTeam.currentPlayer);
			expect(obj.timeRemaining).to.equal(game.timePerRound)
		})
		it("initially our current word pool has the same size of original word pool", function(done){
			expect(game.currentPool).to.deep.equal(game.wordpool);
			done();
		})
})

describe("when you move on to the next round", function(done){
	var result;

	before(function(){
		game.nextRound(function(json){
			result = json;
		})
	})

	it("it should increase round count by one", function(){
		expect(game.currentRound).to.equal(2);
	})
	it("current team is team 2", function(){
		expect(game.currentTeam.teamId).to.equal("team2")
	})
	it("there exists a current player", function(){
		expect(game.currentPlayer).to.not.equal(undefined)
	})
	it("current player is the first player of team 2", function(){
		expect(game.currentPlayer).to.equal(game.team2.get(0))
	})
	it("returns a JSON object describing the current state of the game", function(){
		var obj = JSON.parse(result);
		expect(obj.currentRound).to.equal(game.currentRound);
		expect(obj.currentTeam.teamId).to.deep.equal(game.currentTeam.teamId);
		expect(obj.currentTeam.players).to.deep.equal(game.currentTeam.players);
		expect(obj.currentTeam.currentPlayer).to.deep.equal(game.currentTeam.currentPlayer);
		expect(obj.timeRemaining).to.equal(game.timePerRound);
	})
	it("initially our current word pool has the same size of original word pool", function(done){
		expect(game.currentPool).to.deep.equal(game.wordpool);
		done();
	})
})



describe("When we pull words from our wordpool", function(){

	var result;

	before(function(){
		game.pullWord(function(err, word){
			result = word;
		})
	})

	it("current pool has one less length than original word pool",function(){
		expect(game.currentPool.length).to.equal(game.wordpool.length-1);
	})
	it("callback result is not null nor undefined",function(){
		expect(result).to.not.equal(null);
		expect(result).to.not.equal(undefined);
	})	
	it("the result has a user property",function(){
		expect(result.creator).to.equal('a');
	})	

	//pull all words out of the currentPool
	after(function(){
		while(game.currentPool.length>0){
			game.pullWord(function(err, word){
			})
		}
	})
})

describe("When we've pulled all the words from the current word pool", function(){

	var error;

	before(function(){
		game.pullWord(function(err, word){
			error = err;
		})
	})

	it("should trigger true to show words ran out",function(){
		expect(error).to.equal(true);
	})

})

describe("when you move on to the final round", function(){
	var result;

	before(function(){
		game.nextRound(function(json){
			result = json;
		})
	})

	it("it should increase round count by one", function(){
		expect(game.currentRound).to.equal(3);
	})
	it("current team is team 1", function(){
		expect(game.currentTeam.teamId).to.equal("team1")
	})
	it("there exists a current player", function(){
		expect(game.currentPlayer).to.not.equal(undefined)
	})
	it("current player is the first player of team 1", function(){
		expect(game.currentPlayer).to.equal(game.team1.get(0))
	})
	it("returns a JSON object describing the current state of the game", function(){
		var obj = JSON.parse(result);
		expect(obj.currentRound).to.equal(game.currentRound);
		expect(obj.currentTeam.teamId).to.deep.equal(game.currentTeam.teamId);
		expect(obj.currentTeam.players).to.deep.equal(game.currentTeam.players);
		expect(obj.currentTeam.currentPlayer).to.deep.equal(game.currentTeam.currentPlayer);
		expect(obj.timeRemaining).to.equal(game.timePerRound);
	})
	it("initially our current word pool has the same size of original word pool", function(){
		expect(game.currentPool).to.deep.equal(game.wordpool);
	})
})

describe("when we call for the next player", function(){
	before(function(){
		game.nextPlayer(false);
	})

	it("current team is team 1", function(){
		expect(game.currentTeam.teamId).to.equal("team1")
	})
	it("there exists a current player", function(){
		expect(game.currentPlayer).to.not.equal(undefined)
	})
	it("current player is the second player of team 1", function(){
		expect(game.currentPlayer).to.deep.equal(game.team1.get(1))
	})
})

describe("when we call for the next player with switching", function(){
	before(function(){
		game.nextPlayer(true);
	})

	it("current team is now team 2", function(){
		expect(game.currentTeam.teamId).to.equal("team2")
	})
	it("there exists a current player", function(){
		expect(game.currentPlayer).to.not.equal(undefined)
	})
	it("current player is the first player of team 2", function(){
		expect(game.currentPlayer).to.deep.equal(game.team2.get(0))
	})
})
