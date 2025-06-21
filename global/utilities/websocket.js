const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8080 });
wss.on('connection', function connection(ws) {
  console.log('Frontend connected via WebSocket');
});

function broadcastToClient(data) {
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
}

module.exports = broadcastToClient;