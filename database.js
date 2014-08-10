var dburl = "saladbowl";
var collections = ["gamesLog","gameData","gameData.wordpool"];

var db = require("mongojs").connect(dburl, collections);
db.createCollection("gameData");
//b.gameData.createCollection("wordpool");

module.exports = db;