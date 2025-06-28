const axios = require('axios');
const env = require('@global/utilities/env');
const state = require('@global/utilities/state');

async function handleClipUtility() {
  try {
    const res = await axios.get(`https://api.twitch.tv/helix/clips`, {
      params: {
        broadcaster_id: env.twitch.channel.id,
        first: 10
      },
      headers: {
        'Client-ID': env.twitch.bot.clientId,
        'Authorization': `Bearer ${env.twitch.bot.accessToken}`
      }
    });

    const recentClips = res.data.data;

    for (const clip of recentClips) {
      const clipId = clip.id;

      if (!state.isClipInitialized) {
        state.knownClipIds.add(clipId);
        continue;
      }

      if (!state.knownClipIds.has(clipId)) {
        state.knownClipIds.add(clipId);
        try {
            await axios.post(env.discord.webhook.clip, {
                username: clip.creator_name,
                content: `${clip.creator_name} created a new clip: ${clip.title} → ${clip.url}`,
            });
        } catch (error) {
            console.error('Failed to send clip to Discord:', error.message);
        }
      }
    }

    state.isClipInitialized = true;
  } catch (err) {
    console.error('Error fetching clips:', err.response?.data || err.message);
  }
}

module.exports = handleClipUtility;
