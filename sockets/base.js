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
  var game = new gm("Derek's Game");
  io.on('connection', function (socket) {
    console.log('A connection was made');
    socket.on('login', function(username){  
        socket.username = username;
        console.log('User ' + username + ' connected');
        socket.emit('serverMessage', "currently logged in as " + username);
        //socket.broadcast.emit('chat message', username + " entered the room")
      })

    socket.emit('login');


    socket.on('submissions', function (msg) {
      //io.sockets.emit('chat message', socket.username + " : " + msg);

      game.addWord(socket.username, msg, function(err, count, reachedMax){
        if(err) {console.log(err);return};
        console.log(count);
        socket.emit('serverMessage', "You submitted '" + msg + "', we currently have " + count + " words.");
        socket.broadcast.emit('serverMessage', socket.username + " made a submission, we currently have " + count + " words.");
        if(reachedMax){
          socket.emit('serverMessage', "Max is reached");
        }
      })
      //refactor this to game.addWord(user, msg, function(count))

      console.log('broadcast complete');
    });


  });
};