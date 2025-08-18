const axios = require('axios');

const exchange_code = async (code) => {
  const response = await axios.post('https://id.twitch.tv/oauth2/token', null, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    params: {
      client_id: Config.twitch.app.clientId,
      client_secret: Config.twitch.app.clientSecret,
      code,
      grant_type: 'authorization_code',
      redirect_uri: Config.twitch.app.redirectUrl,
    },
  });

  return response.data.access_token;
};

module.exports = exchange_code;