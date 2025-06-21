const axios = require('axios');

let initialized = false;
let knownFollowerIds = new Set();

async function handleFollowUtility(broadcasterId, clientId, accessToken, callback) {
  try {
    const res = await axios.get(`https://api.twitch.tv/helix/channels/followers`, {
      params: {
        broadcaster_id: broadcasterId,
        first: 10
      },
      headers: {
        'Client-ID': clientId,
        'Authorization': `Bearer ${accessToken}`
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
