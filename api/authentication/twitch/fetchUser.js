const axios = require('axios');
const env = require('@global/utilities/env');

module.exports = async function fetchUser(accessToken) {
  const response = await axios.get('https://api.twitch.tv/helix/users', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Client-Id': env.twitch.app.clientId,
    },
  });

  return response.data.data[0];
};
