// DOCS: https://dev.twitch.tv/docs/eventsub/eventsub-subscription-types/#channelad_breakbegin
const { broadcastToClient } = require('@global/utilities/websocket');
const channelName = Config.twitch.channel.username;
const axios = require('axios');

const accessToken = Config.twitch.channel.accessToken;
const clientId = Config.twitch.channel.clientId;
const userId = Config.twitch.channel.id;

async function connect(sessionId) {
  await axios.post('https://api.twitch.tv/helix/eventsub/subscriptions', {
    type: 'channel.ad_break.begin',
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
  try {
    if (!payload?.duration_seconds) return;

    adRunning = true;

    const duration = payload.duration_seconds;

    broadcastToClient({ type: 'AD_START', duration });
    client.say(channelName, '📺 Running an ad now!');

    if (adTimeout) clearTimeout(adTimeout);

    adTimeout = setTimeout(() => {
      adRunning = false;
      broadcastToClient({ type: 'AD_END' });
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
