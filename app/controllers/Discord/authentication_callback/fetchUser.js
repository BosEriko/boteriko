const axios = require('axios');

module.exports = async function fetchUser(accessToken) {
  const response = await axios.get('https://discord.com/api/users/@me', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return response.data;
};
