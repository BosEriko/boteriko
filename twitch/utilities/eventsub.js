const WebSocket = require('ws');
const axios = require('axios');
const env = require('@global/utilities/env');
const handleErrorUtility = require('@global/utilities/error');
const firebaseUtility = require('@global/utilities/firebase');
const walletUtility = require('@global/utilities/wallet');

let ws;
let reconnectUrl = null;

const channelName = env.twitch.channel.username;

const handleNotification = async (client, payload) => {
  const { reward, user_id, user_name } = payload;
  const rtdb = firebaseUtility.database();

  try {
    switch (reward.title) {
      case 'Currency Conversion': {
        await walletUtility(rtdb, user_id, { coins: reward.cost });
        client.say(channelName, `💰 Converted ${reward.cost} Bos Points to ${reward.cost} Bos Coins on ${user_name}'s wallet`);
        break;
      }

      default:
        console.warn(`⚠️ Unhandled reward: "${reward.title}"`);
        break;
    }
  } catch (err) {
    await handleErrorUtility(`Error handling reward "${reward.title}" for ${user_name}:`, err);
  }
};

function handleEventsubUtility(client) {
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
            await handleNotification(client, eventPayload.event);
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
