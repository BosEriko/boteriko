const axios = require('axios');

const fetch_user = async (token) => {
  const response = await axios.get('https://api.twitch.tv/helix/users', {
    headers: {
      Authorization: `Bearer ${token}`,
      'Client-Id': Config.twitch.app.clientId,
    },
  });

  return response.data.data[0];
};

module.exports = fetch_user;