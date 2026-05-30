// DOCS: https://dev.twitch.tv/docs/api/reference#get-users
const axios = require('axios');

const read_users_id = async (usernames = [Config.twitch.channel.username]) => {
  try {
    const query = usernames.map((username) => `login=${encodeURIComponent(username)}`).join('&');
    const response = await axios.get(
      `https://api.twitch.tv/helix/users?${query}`,
      {
        headers: {
            'Client-ID': Config.twitch.bot.clientId,
            'Authorization': `Bearer ${Config.twitch.bot.accessToken}`
        },
      }
    );

    return response.data.data?.map((user) => user.id);
  } catch (err) {
    await Utility.error_logger('Failed to fetch user ID:', err.response?.data || err.message);
    return null;
  }
}

module.exports = read_users_id;
