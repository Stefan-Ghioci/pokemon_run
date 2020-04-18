var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io').listen(server);

var eeveeLFG = [];
var pikachuLFG = [];
var games = [];

app.use(express.static(__dirname + '/public'));

app.get('/', function (_req, res) {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function (socket) {
  console.log('a user connected');

  socket.on('lfg', function (selectedCharacter) {
    if (selectedCharacter === 0) {
      pikachuLFG.push(socket.id);
      console.log(pikachuLFG.length + ' Pikachu looking for Eevee');
    } else {
      eeveeLFG.push(socket.id);
      console.log(eeveeLFG.length + ' Eevee looking for Pikachu');
    }

    if (eeveeLFG.length > 0 && pikachuLFG.length > 0) {
      console.log('Match found');
      var eeveeID = eeveeLFG.shift();
      var pikachuID = pikachuLFG.shift();

      games.push({ eeveeID, pikachuID, pikachuScore: 0, eeveeScore: 0 });
      io.to(eeveeID).emit('game found', null);
      io.to(pikachuID).emit('game found', null);
    }
  });

  socket.on('player moved', function (cursors) {
    var opponentID = getOpponentID(socket.id);

    io.to(socket.id).emit('player moved', cursors);
    io.to(opponentID).emit('opponent moved', cursors);
  });

  socket.on('disconnect', function () {
    console.log('user disconnected');

    clearLFG(socket.id);

    const opponentID = getOpponentID(socket.id);
    if (opponentID !== null) io.to(opponentID).emit('autowin', null);
  });
});

function clearLFG(playerID) {
  removeElement(eeveeLFG, playerID);
  removeElement(pikachuLFG, playerID);
}

function removeElement(array, object) {
  for (var i = array.length - 1; i >= 0; i--) {
    if (array[i] === object) {
      array.splice(i, 1);
    }
  }
}

function getOpponentID(playerID) {
  var opponentID = null;
  games.some((game) => {
    if (game.pikachuID === playerID) {
      opponentID = game.eeveeID;
    }
    if (game.eeveeID === playerID) {
      opponentID = game.pikachuID;
    }
  });
  return opponentID;
}

server.listen(8081, function () {
  console.log(`Listening on ${server.address().port}`);
});
