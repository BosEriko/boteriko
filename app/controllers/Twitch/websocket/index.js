const WebSocket = require('ws');
const axios = require('axios');
const points = require('./points');

let ws;
let reconnectUrl = null;
let lastPing = Date.now();
let heartbeatInterval = null;

function websocket(client) {
  const accessToken = Config.twitch.channel.accessToken;
  const clientId = Config.twitch.channel.clientId;
  const userId = Config.twitch.channel.id;

  const connect = (url = 'wss://eventsub.wss.twitch.tv/ws') => {
    if (ws) {
      ws.removeAllListeners();
      ws.terminate();
    }

    ws = new WebSocket(url);

    ws.on('open', () => {
      console.log('✅ Connected to Twitch EventSub WebSocket.');
      lastPing = Date.now();
      setupHeartbeat();
    });

    ws.on('message', async (data) => {
      try {
        const payload = JSON.parse(data);
        const { metadata, payload: eventPayload } = payload;

        switch (metadata.message_type) {
          case 'session_welcome': {
            const sessionId = eventPayload.session.id;

            // Subscribe to channel points redemption
            const response = await axios.post('https://api.twitch.tv/helix/eventsub/subscriptions', {
              type: 'channel.channel_points_custom_reward_redemption.add',
              version: '1',
              condition: { broadcaster_user_id: userId },
              transport: { method: 'websocket', session_id: sessionId }
            }, {
              headers: {
                'Client-ID': clientId,
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
              }
            });

            console.log('✅ Connected to Channel Points WebSocket.');
            break;
          }

          case 'notification': {
            await points(client, eventPayload.event);
            break;
          }

          case 'session_reconnect': {
            reconnectUrl = eventPayload.session.reconnect_url;
            console.warn('🔁 Twitch requested reconnect. Reconnecting...');
            reconnect();
            break;
          }

          case 'session_disconnect': {
            console.warn('❌ Session disconnected. Attempting reconnect...');
            reconnect();
            break;
          }

          case 'session_keepalive': {
            lastPing = Date.now();
            console.log('💓 Received keepalive ping from Twitch');
            break;
          }

          default:
            console.log('📩 Unknown message type:', metadata.message_type);
            break;
        }
      } catch (err) {
        await Utility.error_logger('Twitch EventSub WebSocket error:', err);
      }
    });

    ws.on('close', async (code, reason) => {
      console.warn(`⚠️ WebSocket closed: ${code} ${reason}`);
      reconnect();
    });

    ws.on('error', async (err) => {
      await Utility.error_logger('WebSocket error:', err);
      reconnect();
    });
  };

  const setupHeartbeat = () => {
    if (heartbeatInterval) clearInterval(heartbeatInterval);

    heartbeatInterval = setInterval(() => {
      if (Date.now() - lastPing > 20000) {
        console.warn('❌ Missed Twitch keepalive ping. Reconnecting...');
        reconnect();
      }
    }, 10000);
  };

  const reconnect = () => {
    if (ws && ws.readyState !== WebSocket.CLOSED) {
      console.log(`🛑 Forcing cleanup of WebSocket. Current state: ${ws.readyState}`);
      ws.terminate();
    }

    setTimeout(() => {
      if (reconnectUrl) {
        console.log('🔄 Reconnecting to new session URL...');
        connect(reconnectUrl);
        reconnectUrl = null;
      } else {
        console.log('🔄 Reconnecting to Twitch EventSub...');
        connect();
      }
    }, 3000);
  };

  connect();

  // Global failsafe logs
  process.on('unhandledRejection', (reason, promise) => {
    console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
  });

  process.on('uncaughtException', (err) => {
    console.error('💥 Uncaught Exception:', err);
  });
}

module.exports = websocket;
