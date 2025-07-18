const WebSocket = require('ws');
const axios = require('axios');
const env = require('@global/utilities/env');
const handleErrorUtility = require('@global/utilities/error');

let ws;
let reconnectUrl = null;

const handleNotification = () => {
  console.log("Redeem Channel Points Award");
  // redemption
  // {
  //   broadcaster_user_id: '61103553',
  //   broadcaster_user_login: 'boseriko',
  //   broadcaster_user_name: 'BosEriko',
  //   id: 'a3ee5c91-b1a6-40e7-a59d-969ef567335b',
  //   user_id: '61103553',
  //   user_login: 'boseriko',
  //   user_name: 'BosEriko',
  //   user_input: '',
  //   status: 'unfulfilled',
  //   redeemed_at: '2025-07-18T00:47:00.989405935Z',
  //   reward: {
  //     id: 'be0f983e-fc24-4a97-ad6f-524b4053c934',
  //     title: 'Blink',
  //     prompt: '',
  //     cost: 50
  //   }
  // }
}

function handleEventsubUtility() {
  const accessToken = env.twitch.channel.accessToken;
  const clientId = env.twitch.channel.clientId;
  const userId = env.twitch.channel.id;

  const connect = (url = 'wss://eventsub.wss.twitch.tv/ws') => {
    ws = new WebSocket(url);

    ws.on('open', () => {
      console.log('✅ Connected to Twitch EventSub WebSocket');
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
              condition: {
                broadcaster_user_id: userId
              },
              transport: {
                method: 'websocket',
                session_id: sessionId
              }
            }, {
              headers: {
                'Client-ID': clientId,
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
              }
            });

            console.log('✅ Subscription success:', response.data);
            break;
          }

          case 'notification': {
            handleNotification(eventPayload.event);
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
            console.log('💓 Received keepalive ping from Twitch');
            break;
          }

          default:
            console.log('📩 Unknown message type:', metadata.message_type);
            break;
        }
      } catch (err) {
        await handleErrorUtility('Twitch EventSub WebSocket error:', err);
      }
    });

    ws.on('close', async (code, reason) => {
      console.warn(`⚠️ WebSocket closed: ${code} ${reason}`);
      reconnect();
    });

    ws.on('error', async (err) => {
      await handleErrorUtility('WebSocket error:', err);
      reconnect();
    });
  };

  const reconnect = () => {
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
}

module.exports = handleEventsubUtility;
