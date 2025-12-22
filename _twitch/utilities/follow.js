const axios = require('axios');
const state = require('@global/utilities/state');
const { broadcastToClient } = require('@global/utilities/websocket');
const handleUserUtility = require('@global/utilities/user');

const QUICK_ADD_URL = 'https://api.todoist.com/sync/v9/quick/add';
const TODOIST_HEADERS = { Authorization: `Bearer ${Config.other.todoist.apiToken}` };

async function handleFollowUtility(client) {
  try {
    const res = await axios.get(`https://api.twitch.tv/helix/channels/followers`, {
      params: {
        broadcaster_id: Config.twitch.channel.id,
        first: 10
      },
      headers: {
        'Client-ID': Config.twitch.bot.clientId,
        'Authorization': `Bearer ${Config.twitch.bot.accessToken}`
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

      // -------------------- Save to Todoist --------------------
      let user = null;
      try {
        user = await handleUserUtility(followerId);
      } catch (userErr) {
        await Utility.error_logger('Failed to fetch user details:', userErr.message);
      }

      if (user && ['affiliate', 'partner'].includes(user.broadcaster_type)) {
        try {
          const todoContent = `New follower: [${user.display_name}](https://www.twitch.tv/${user.login}) @new-followers`;
          await axios.post(QUICK_ADD_URL, { text: todoContent }, { headers: TODOIST_HEADERS });
        } catch (todoErr) {
          await Utility.error_logger('Failed to add follower to Todoist:', todoErr.response?.data || todoErr.message);
        }
      }
      // ---------------------------------------------------------------

      const message = `${follower.user_name} just followed!`;
      broadcastToClient({ type: 'FEED', feed_type: 'event', message });
      client.say(`#${Config.twitch.channel.username}`, message);
    }

    state.isFollowerInitialized = true;
  } catch (err) {
    await Utility.error_logger('Error fetching followers:', err.response?.data || err.message);
  }
}

module.exports = handleFollowUtility;
