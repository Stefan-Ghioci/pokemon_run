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

      var seed = Math.random() * 1000;

      io.to(eeveeID).emit('game found', seed);
      io.to(pikachuID).emit('game found', seed);
    }
  });

  socket.on('finish line', function () {
    var newScore = changeScore(socket.id);
    console.log("new score" + newScore)
    var opponentID = getOpponentID(socket.id);

    io.to(socket.id).emit('round won', newScore);
    io.to(opponentID).emit('round lost', newScore);
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

const clearLFG = (playerID) => {
  removeElement(eeveeLFG, playerID);
  removeElement(pikachuLFG, playerID);
};

const removeElement = (array, object) => {
  for (var i = array.length - 1; i >= 0; i--) {
    if (array[i] === object) {
      array.splice(i, 1);
    }
  }
};

const changeScore = (playerID) => {
  var newScore = null;

  games.some((game) => {
    if (game.pikachuID === playerID) {
      game.pikachuScore += 1;
      newScore = { pikachuScore: game.pikachuScore, eeveeScore: game.eeveeScore };
    }
    if (game.eeveeID === playerID) {
      game.eeveeScore += 1;
      newScore = { pikachuScore: game.pikachuScore, eeveeScore: game.eeveeScore };
    }
  });

  return newScore;
};

const getOpponentID = (playerID) => {
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
};

server.listen(8081, function () {
  console.log(`Listening on ${server.address().port}`);
});
