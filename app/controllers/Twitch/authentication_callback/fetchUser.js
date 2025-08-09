const axios = require('axios');

module.exports = async function fetchUser(accessToken) {
  const response = await axios.get('https://api.twitch.tv/helix/users', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Client-Id': Config.twitch.app.clientId,
    },
  });

  return response.data.data[0];
};
