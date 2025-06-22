const axios = require('axios');
const env = require('@global/utilities/env');

let initialized = false;
let knownFollowerIds = new Set();

async function handleFollowUtility(callback) {
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
        callback(follower.user_name);
      }
    }

    knownFollowerIds = new Set(recentFollowers.map(f => f.user_id));
    initialized = true;
  } catch (err) {
    console.error('Error fetching followers:', err.response?.data || err.message);
  }
}

module.exports = handleFollowUtility;
