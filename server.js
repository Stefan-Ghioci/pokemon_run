var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io').listen(server);

var players = {};
var eeveeLFG = [];
var pikachuLFG = [];
var games = {};

app.use(express.static(__dirname + '/public'));

app.get('/', function (_req, res) {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function (socket) {
  console.log('a user connected');
  players[socket.id] = { playerID: socket.id, pos: { x: 0, y: 0 } };

  socket.on('lfg', function (selectedCharacter) {
    if (selectedCharacter === 0) {
      pikachuLFG.push(socket.id);
      console.log(pikachuLFG.length + ' Pikachu looking for Eevee');
    } else {
      eeveeLFG.push(socket.id);
      console.log(eeveeLFG.length + ' Eevee looking for Pikachu');
    }
  });

  socket.on('disconnect', function () {
    console.log('user disconnected');
    delete players[socket.id];
    clearLFG(socket.id);
  });
});

function clearLFG(playerID) {
    removeElement(eeveeLFG, playerID);
    removeElement(pikachuLFG, playerID);
}

function removeElement(array, object){
    for(var i = array.length - 1; i >= 0; i--) {
        if(array[i] === object) {
            array.splice(i, 1);
        }
    }
}

server.listen(8081, function () {
  console.log(`Listening on ${server.address().port}`);
});
