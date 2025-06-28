const axios = require('axios');
const env = require('@global/utilities/env');
const { broadcastToClient } = require('@global/utilities/websocket');

let initialized = false;
let knownFollowerIds = new Set();

async function handleFollowUtility(client) {
  try {
    const res = await axios.get(`https://api.twitch.tv/helix/channels/followers`, {
      params: {
        broadcaster_id: env.twitch.channel.id,
        first: 10
      },
      headers: {
        'Client-ID': env.twitch.bot.clientId,
        'Authorization': `Bearer ${env.twitch.bot.accessToken}`
      }
    });

    const recentFollowers = res.data.data;

    for (const follower of recentFollowers) {
      const followerId = follower.user_id;

      if (!initialized) {
        knownFollowerIds.add(followerId);
        continue;
      }

      if (!knownFollowerIds.has(followerId)) {
        knownFollowerIds.add(followerId);
        const message = `${follower.user_name} just followed!`;
        broadcastToClient({ type: 'NOTIFICATION', event_type: 'follow', message });
        client.say(`#${env.twitch.channel.username}`, message);
      }
    }

    knownFollowerIds = new Set(recentFollowers.map(f => f.user_id));
    initialized = true;
  } catch (err) {
    console.error('Error fetching followers:', err.response?.data || err.message);
  }
}

module.exports = handleFollowUtility;
