//Need to add host options for editting game parameters
/*  
 - Number of players (should we do this before game room initiates?)
 - which team players belong to(randomize or assigned)
 - time per round
 - max word limit
*/

var db = require('./database');
var gm = require('./game');
var Game = require('./schemas/game');
var Team = require('./team');

module.exports = function (io) {

    io.sockets.on('connection', function (socket) {

      console.log('A connection was made');
      var _room;
      var _roomName;

      socket.on('join', function(data){
        Game.findByRoom( data.room, function( err, game ) {
         if(err){
          return;
         }
         if ( game ) {

            _room = game._id;
            _roomName = game.roomName;
           // Join the room.
           socket.join( _room );

             // Now emit messages to everyone else in this room.  If other
             // players in this game are connected, only those clients 
             // will receive the message
             io.sockets.in( _room ).emit('joined', "joined room " + _room);
             socket.emit('login');
           }
        });
      });

      socket.on('login', function(data){
          console.log(data);
          console.log(data.username + ":" + socket.id);
          //make it so that the first player to join is also the host  
          Game.createPlayer(_room, data.username, socket.id, function(err, teams){
            if(err) {console.log(err); return}
            else {
              console.log("the data from server is " + teams);
              socket.username = data.username; 
              //console.log('User ' + username + ' connected');
              io.sockets.in(_room).emit('teamUpdate', teams);
            }       
          
        })
      });
      

      socket.on('submissions', function (msg) {
        Game.addWord(_room, socket.username, msg, function(err, game, count, reachedMax){
          if(err) {console.log(err);return};
          /*
          socket.emit('serverMessage', "You submitted '" + msg + "', we currently have " + count + " words.", count);
          socket.broadcast.emit('serverMessage', socket.username + " made a submission, we currently have " + count + " words.", count);
          */
          io.sockets.in(_room).emit('countDown', count);
     
          if(reachedMax){
            /*socket.emit('serverMessage', "Max is reached");
            socket.broadcast.emit('serverMessage', "Max is reached");*/
            Game.firstRound(game, function(err, game, json){
              console.log(err);
              io.sockets.in(_room).emit('roundChange', json);
              Game.pullWord(game, function(err, word, socketId){
                socket.broadcast.nsp.to(socketId).emit('word', word);
              })
            })
          }
        })
      });

      socket.on('wordResponse', function(response){
        console.log(response.word);

        Game.pushWord(_room, response.correct, response.word, function(err,scores,game){
           io.sockets.in(_room).emit("scoreUpdate", scores);
            Game.updateTime(game, response.word.returnTime, function(game){
              Game.nextPlayer(game, response.correct, response.switching, function(game){
                Game.pullWord(game, function(err, word, socketId){
                  if(err){
                    Game.nextRound(game, function(err, game, json){
                      console.log("this got ran!");
                      io.sockets.emit('roundChange', json);
                      Game.pullWord(game, function( err, word, socketId){
                        socket.broadcast.nsp.to(socketId).emit('word', word);
                      })
                    })
                  }
                  else{
                    socket.broadcast.nsp.to(socketId).emit('word', word);
                  }
                })
              });
            });    
        });
    });
  });
}