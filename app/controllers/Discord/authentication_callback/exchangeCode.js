const axios = require('axios');

module.exports = async function exchangeCode(code) {
  const response = await axios.post(
    'https://discord.com/api/oauth2/token',
    new URLSearchParams({
      client_id: Config.discord.app.clientId,
      client_secret: Config.discord.app.clientSecret,
      code,
      grant_type: 'authorization_code',
      redirect_uri: Config.discord.app.redirectUrl,
    }),
    { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
  );

  return response.data.access_token;
};
