const axios = require('axios');

module.exports = async function exchangeCode(code) {
  const response = await axios.post('https://id.twitch.tv/oauth2/token', null, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    params: {
      client_id: env.twitch.app.clientId,
      client_secret: env.twitch.app.clientSecret,
      code,
      grant_type: 'authorization_code',
      redirect_uri: env.twitch.app.redirectUrl,
    },
  });

  return response.data.access_token;
};
