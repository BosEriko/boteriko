const axios = require('axios');
const env = require('@global/utilities/env');
const handleErrorUtility = require('@global/utilities/error');

async function handleIsStreamingUtility() {
  try {
      const url = `https://api.twitch.tv/helix/streams?user_login=${env.twitch.channel.username}`;
      const response = await axios.get(url, {
          headers: {
              'Client-ID': env.twitch.bot.clientId,
              'Authorization': `Bearer ${env.twitch.bot.accessToken}`
          }
      });

      return response.data.data.length > 0;
  } catch (error) {
      await handleErrorUtility("Error fetching streamer status:", error);
      return false;
  }
}

module.exports = handleIsStreamingUtility;
