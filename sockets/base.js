//Need to add host options for editting game parameters
/*  
 - Number of players (should we do this before game room initiates?)
 - which team players belong to(randomize or assigned)
 - time per round
 - max word limit
*/

var db = require('../database');
var gm = require('../game')

module.exports = function (io) {

    'use strict';
    var game = new gm("Derek's Game"); //right now creating a new game on every server boot, need to create/load game depend on socket room

    io.on('connection', function (socket) {


      console.log('A connection was made');

      socket.on('login', function(username){
          //make it so that the first player to join is also the host  
          gm.createPlayer(username, socket.id, function(err){
            if(err) return;
            else {
              socket.username = username; 
              console.log('User ' + username + ' connected');
              socket.emit('serverMessage', "currently logged in as " + username);   
            }       
          
        })
      });

      socket.emit('login');

      //

      socket.on('submissions', function (msg) {
        game.addWord(socket.username, msg, function(err, count, reachedMax){
          if(err) {console.log(err);return};

          socket.emit('serverMessage', "You submitted '" + msg + "', we currently have " + count + " words.");
          socket.broadcast.emit('serverMessage', socket.username + " made a submission, we currently have " + count + " words.");

          if(reachedMax){
            socket.emit('serverMessage', "Max is reached");
            socket.broadcast.emit('serverMessage', "Max is reached");
            game.firstRound(function(json){
              socket.emit('roundChange', json);
              socket.broadcast.emit('roundChange', json)
            })
          }
        })
      });

      //add logic to client, when round change, the next player is flagged, so that player will send a ready to receive 
      //signal to server, server will then send over the word plus current state of the game
      socket.on('clientToReceive', function(){
          game.loadGame(socket.username, function(err, json){
              if(err) return;
              else {
                socket.emit("gameResponse", json)
                socket.broadcast.emit("gameResponse", json)
              }
          })
      });

      //add logic to client response, tell server what the word was, whether or not the word is correct, 
      socket.on('clientResponse', function(word, correct, timeTook, timeRemaining){
        if(!correct || timeRemaining < 0){
          game.switchTeam(function(){})
        }
      });
  });
};