const axios = require('axios');
const env = require('@global/utilities/env');
const handleErrorUtility = require('@global/utilities/error');

async function handleStreamDetailUtility() {
  try {
      const url = `https://api.twitch.tv/helix/streams?user_login=${env.twitch.channel.username}`;
      const response = await axios.get(url, {
          headers: {
              'Client-ID': env.twitch.bot.clientId,
              'Authorization': `Bearer ${env.twitch.bot.accessToken}`
          }
      });

      return response.data.data[0]
  } catch (error) {
      await handleErrorUtility("Error fetching stream details:", error);
      return false;
  }
}

module.exports = handleStreamDetailUtility;
