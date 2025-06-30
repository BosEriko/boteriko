const axios = require('axios');
const env = require('@global/utilities/env');
const state = require('@global/utilities/state');
const handleUserUtility = require('@twitch/utilities/user');
const sendToDiscordUtility = require('@twitch/utilities/sendToDiscord');

async function handleClipUtility() {
  try {
    const res = await axios.get(`https://api.twitch.tv/helix/clips`, {
      params: {
        broadcaster_id: env.twitch.channel.id,
        first: 20,
        started_at: state.latestClipTimestamp || new Date(Date.now() - 1000 * 60 * 60).toISOString()
      },
      headers: {
        'Client-ID': env.twitch.bot.clientId,
        'Authorization': `Bearer ${env.twitch.bot.accessToken}`
      }
    });

    let recentClips = res.data.data;

    if (!recentClips || recentClips.length === 0) {
      console.log('[Clips] No new clips found.');
      return;
    }

    recentClips.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

    for (const clip of recentClips) {
      const clipId = clip.id;
      const createdAt = new Date(clip.created_at);

      if (!state.isClipInitialized) {
        state.knownClipIds.add(clipId);
        if (!state.latestClipTimestamp || createdAt > new Date(state.latestClipTimestamp)) {
          state.latestClipTimestamp = createdAt.toISOString();
        }
        continue;
      }

      if (state.knownClipIds.has(clipId)) continue;
      if (new Date(state.latestClipTimestamp) >= createdAt) continue;

      state.knownClipIds.add(clipId);
      state.latestClipTimestamp = createdAt.toISOString();

      const user = await handleUserUtility(clip.creator_name);
      await sendToDiscordUtility(user, `${clip.title} → ${clip.url}`, env.discord.webhook.clip);
    }

    state.isClipInitialized = true;
  } catch (err) {
    console.error('Error fetching clips:', err.response?.data || err.message);
  }
}

module.exports = handleClipUtility;
