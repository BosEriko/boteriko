// DOCS: https://dev.twitch.tv/docs/api/reference#get-users
const axios = require('axios');

const read_user_id = async (username = Config.twitch.channel.username) => {
  try {
    const response = await axios.get(
      `https://api.twitch.tv/helix/users?login=${username}`,
      {
        headers: {
            'Client-ID': Config.twitch.bot.clientId,
            'Authorization': `Bearer ${Config.twitch.bot.accessToken}`
        },
      }
    );

    return response.data.data[0]?.id;
  } catch (err) {
    await Utility.error_logger('Failed to fetch user ID:', err.response?.data || err.message);
    return null;
  }
}

module.exports = read_user_id;
