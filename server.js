// Archivo: server.js
const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8080 });

let games = {}; // Juegos por pareja

wss.on('connection', (ws) => {
  ws.on('message', (data) => {
    const message = JSON.parse(data);

    if (message.type === 'join') {
      const { gameId, player } = message;
      
      if (!games[gameId]) {
        games[gameId] = { players: {}, moves: [] };
      }

      games[gameId].players[player] = ws;

      // Notificar que se unió
      ws.send(JSON.stringify({ type: 'joined', gameId, player }));
    } else if (message.type === 'move') {
      const { gameId, move } = message;
      games[gameId].moves.push(move);

      // Notificar a la pareja del movimiento
      Object.values(games[gameId].players).forEach((playerWs) => {
        if (playerWs !== ws) {
          playerWs.send(JSON.stringify({ type: 'move', move }));
        }
      });
    }
  });

  ws.on('close', () => {
    // Opcional: Limpiar juegos desconectados
  });
});

console.log("Servidor WebSocket corriendo en ws://localhost:8080");
