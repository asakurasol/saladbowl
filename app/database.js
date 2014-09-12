var mongoose = require('mongoose');
var dburl = "saladbowl";
var collections = ["gamesLog","gameData","gameData.wordpool"];

/*var db = require("mongojs").connect(dburl, collections);
db.createCollection("gameData");*/

var mongoose = require('mongoose');
db = mongoose.createConnection('localhost', 'saladbowl');
db.on('error', console.error.bind(console, 'connection error:'));

module.exports = db;