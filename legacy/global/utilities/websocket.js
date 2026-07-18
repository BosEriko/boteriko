const WebSocket = require('ws');
const { getVoiceState, subscribe } = require('../../discord/utilities/voice_state');

let wss = null;

function setupWebSocket(server) {
  wss = new WebSocket.Server({ server });

  wss.on('connection', function connection(ws) {
    console.log("✅ Connected to Websocket Server.");

    ws.isAlive = true;
    ws._voiceUnsub = null;

    ws.on('pong', () => {
      ws.isAlive = true;
    });

    ws.on('message', async (msg) => {
      console.log('📨 Received message from client:', msg);

      try {
        const data = JSON.parse(msg);

        if (data.type === 'ping') {
          ws.send(JSON.stringify({ type: 'pong' }));
        }

        if (data.type === 'subscribe_voice_status' && data.discordId) {
          if (ws._voiceUnsub) ws._voiceUnsub();

          const initialState = getVoiceState(data.discordId);
          ws.send(JSON.stringify({ type: 'voice_status', ...initialState }));

          ws._voiceUnsub = subscribe(data.discordId, (state) => {
            if (ws.readyState === WebSocket.OPEN) {
              ws.send(JSON.stringify({ type: 'voice_status_update', ...state }));
            }
          });
        }

        if (data.type === 'unsubscribe_voice_status') {
          if (ws._voiceUnsub) {
            ws._voiceUnsub();
            ws._voiceUnsub = null;
          }
        }
      } catch (e) {
        await Utility.error_logger('❌ Error parsing message:', e);
      }
    });

    ws.on('close', () => {
      if (ws._voiceUnsub) ws._voiceUnsub();
    });
  });

  const interval = setInterval(() => {
    wss.clients.forEach((ws) => {
      if (!ws.isAlive) {
        console.log('❌ Terminating dead connection');
        return ws.terminate();
      }

      ws.isAlive = false;
      ws.ping();
    });
  }, 30000);

  wss.on('close', () => {
    clearInterval(interval);
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
