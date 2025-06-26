const WebSocket = require('ws');

let wss = null;

function setupWebSocket(server) {
  wss = new WebSocket.Server({ server });

  wss.on('connection', function connection(ws) {
    console.log('✅ WebSocket client connected');

    ws.on('message', (msg) => {
      console.log('📨 Received message from client:', msg);
    });
  });
}

function broadcastToClient(data) {
  if (!wss) return;

  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
}

module.exports = { setupWebSocket, broadcastToClient };
