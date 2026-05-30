// DOCS: https://dev.twitch.tv/docs/api/reference#get-streams
const axios = require('axios');

const read_streams_detail = async (usernames = [Config.twitch.channel.username]) => {
  try {
    const query = usernames.map((username) => `user_login=${encodeURIComponent(username)}`).join('&');
    const response = await axios.get(
      `https://api.twitch.tv/helix/streams?${query}`,
      {
        headers: {
            'Client-ID': Config.twitch.bot.clientId,
            'Authorization': `Bearer ${Config.twitch.bot.accessToken}`
        },
      }
    );

    return usernames.map((username) => response.data.data.find((stream) => stream.user_login.toLowerCase() === username.toLowerCase()) || null);
  } catch (err) {
    await Utility.error_logger("Error fetching stream details:", err);
  }
}

module.exports = read_streams_detail;
