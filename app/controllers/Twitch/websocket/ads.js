// DOCS: https://dev.twitch.tv/docs/eventsub/eventsub-subscription-types/#channelad_breakbegin
const { broadcastToClient } = require('@global/utilities/websocket');
const channelName = Config.twitch.channel.username;
const axios = require('axios');

const accessToken = Config.twitch.channel.accessToken;
const clientId = Config.twitch.channel.clientId;
const userId = Config.twitch.channel.id;
const subscriptionType = 'channel.ad_break.begin';

async function connect(sessionId) {
  await axios.post('https://api.twitch.tv/helix/eventsub/subscriptions', {
    type: subscriptionType,
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
  return '✅ Connected to Ads WebSocket.';
}

let adRunning = false;
let adTimeout = null;

async function trigger(client, payload) {
  if (payload.subscription?.type !== subscriptionType) return;
  const { duration_seconds } = payload.event;

  try {
    if (!duration_seconds) return;

    adRunning = true;

    const duration = duration_seconds;

    broadcastToClient({
      type: 'SCREENSAVER',
      ticker: {
        message: "Ad Break",
        isVisible: true
      },
      music: {
        id: 'THE_GRAND_AFFAIR_COUPE',
        isPlaying: true
      }
    });
    client.say(channelName, `📺 Running an ad now! (${duration}s)`);

    if (adTimeout) clearTimeout(adTimeout);

    adTimeout = setTimeout(() => {
      adRunning = false;
      broadcastToClient({
        type: 'SCREENSAVER',
        ticker: {
          message: null,
          isVisible: false
        },
        music: {
          id: null,
          isPlaying: false
        }
      });
      client.say(channelName, '✅ The ad has ended!');
    }, duration * 1000);
  } catch (err) {
    await Utility.error_logger('Error handling ads:', err);
  }
}

const ads = {
  connect,
  trigger,
};

module.exports = ads;
