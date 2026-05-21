// DOCS: https://dev.twitch.tv/docs/eventsub/eventsub-subscription-types#channelfollow
const { broadcastToClient } = require('@global/utilities/websocket');
const channelName = Config.twitch.channel.username;
const axios = require('axios');

const accessToken = Config.twitch.channel.accessToken;
const clientId = Config.twitch.channel.clientId;
const userId = Config.twitch.channel.id;
const subscriptionType = 'channel.follow';

async function connect(sessionId) {
  await axios.post('https://api.twitch.tv/helix/eventsub/subscriptions', {
    type: subscriptionType,
    version: '2',
    condition: { broadcaster_user_id: userId, moderator_user_id: userId },
    transport: { method: 'websocket', session_id: sessionId }
  }, {
    headers: {
      'Client-ID': clientId,
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    }
  });
  return '✅ Connected to Follow WebSocket.';
}

async function trigger(client, payload) {
  if (payload.subscription?.type !== subscriptionType) return;
  const { user_name } = payload.event;

  try {
    const message = `${user_name} just followed!`;
    broadcastToClient({ type: 'FEED', feed_type: 'event', message });
    client.say(channelName, message);
  } catch (err) {
    await Utility.error_logger('Error fetching followers:', err.response?.data || err.message);
  }
}

module.exports = {
  connect,
  trigger
};
