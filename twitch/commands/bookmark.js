const axios = require('axios');
const env = require('@global/utilities/env');
const state = require('@global/utilities/state');
const handleErrorUtility = require('@global/utilities/error');

const handleBookmarkCommand = async function (client, channel, prompt) {
  try {
    if (!state.isStreaming || !state.streamDetail) {
      client.say(channel, '⚠️ You are currently offline. No active stream to bookmark.');
      return;
    }

    const { title, started_at } = state.streamDetail;
    const timeZone = env.app.timeZone;

    const streamStartUTC = new Date(started_at);
    const nowUTC = new Date();
    const elapsedMs = nowUTC - streamStartUTC;
    const elapsedSeconds = Math.floor(elapsedMs / 1000);
    const hours = Math.floor(elapsedSeconds / 3600);
    const minutes = Math.floor((elapsedSeconds % 3600) / 60);
    const seconds = elapsedSeconds % 60;

    const timestamp = [
      hours ? `${hours}h` : '',
      minutes ? `${minutes}m` : '',
      seconds ? `${seconds}s` : ''
    ].filter(Boolean).join(' ');

    const localDate = new Intl.DateTimeFormat('en-US', {
      timeZone,
      year: 'numeric',
      month: 'long',
      day: '2-digit'
    }).format(streamStartUTC);

    const message = `🔖 Bookmark added!`;
    client.say(channel, message);

    const webhook = env.discord.webhook.bookmark;
    if (webhook) {
      const avatar_url = "https://i.imgur.com/Fsw2uWB.png";
      const username = "Bookmark";

      const lines = [
        `🎬 **Title:** ${title.split('|')[0].trim()}`,
        `⏱️ **Timestamp:** ${timestamp}`,
        `📅 **Date:** ${localDate}`
      ];

      if (prompt) {
        lines.push(`📝 **Note:** ${prompt}`);
      }

      const content = lines.join('\n');

      await axios.post(webhook, { username, avatar_url, content });
    }
  } catch (err) {
    await handleErrorUtility('❌ Failed to create bookmark', err);
    client.say(channel, '❌ Failed to create bookmark.');
  }
};

module.exports = handleBookmarkCommand;
