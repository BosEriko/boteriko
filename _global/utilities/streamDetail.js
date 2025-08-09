const axios = require('axios');

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
      await Utility.error_logger("Error fetching stream details:", error);
      return false;
  }
}

module.exports = handleStreamDetailUtility;
