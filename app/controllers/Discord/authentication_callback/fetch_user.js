const axios = require('axios');

const fetch_user = async (token) => {
  const response = await axios.get('https://discord.com/api/users/@me', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};

module.exports = fetch_user;
