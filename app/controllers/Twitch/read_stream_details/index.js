// DOCS: https://dev.twitch.tv/docs/api/reference#get-streams
const axios = require('axios');

const read_stream_details = async (username = Config.twitch.channel.username) => {
  try {
    const response = await axios.get(
      `https://api.twitch.tv/helix/streams?user_login=${username}`,
      {
        headers: {
            'Client-ID': Config.twitch.bot.clientId,
            'Authorization': `Bearer ${Config.twitch.bot.accessToken}`
        },
      }
    );

    return response.data.data?.[0];
  } catch (err) {
    await Utility.error_logger("Error fetching stream details:", err);
  }
}

module.exports = read_stream_details;
