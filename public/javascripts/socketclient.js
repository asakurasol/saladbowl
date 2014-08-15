//socketclient

var socket = io();

socket.on('login', function(){
  var username = prompt('What username would you like to use?');
  socket.emit('login', username);
})

$('form').submit(function(){
  socket.emit('submissions',$('#m').val());
  console.log($('#m').val());
  $('#m').val('');
  return false;
});

socket.on('serverMessage', function(msg){
  $('#messages').append($('<li>').text(msg));
});

socket.on("countDown", function(count){
	var result = JSON.stringify({"count" : count});
	console.log(result);
	$('#countDown').html(result);
});


socket.on("roundChange", function(json){
	$('#gameData').html(json);
});
