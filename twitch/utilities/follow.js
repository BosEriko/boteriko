const axios = require('axios');
const env = require('@global/utilities/env');
const state = require('@global/utilities/state');
const { broadcastToClient } = require('@global/utilities/websocket');

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
      const followedAt = new Date(follower.followed_at);

      if (!state.isFollowerInitialized) {
        state.knownFollowerIds.add(followerId);
        if (!state.latestFollowTimestamp || followedAt > new Date(state.latestFollowTimestamp)) {
          state.latestFollowTimestamp = followedAt.toISOString();
        }
        continue;
      }

      if (state.knownFollowerIds.has(followerId)) continue;
      if (new Date(state.latestFollowTimestamp) >= followedAt) continue;

      state.knownFollowerIds.add(followerId);
      state.latestFollowTimestamp = followedAt.toISOString();

      const message = `${follower.user_name} just followed!`;
      broadcastToClient({ type: 'NOTIFICATION', event_type: 'follow', message });
      client.say(`#${env.twitch.channel.username}`, message);
    }

    state.isFollowerInitialized = true;
  } catch (err) {
    console.error('Error fetching followers:', err.response?.data || err.message);
  }
}

module.exports = handleFollowUtility;
