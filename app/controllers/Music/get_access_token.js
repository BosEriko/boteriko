const handleErrorUtility = require('@global/utilities/error');
const env = require('@config/environments/base');
const axios = require('axios');
const cacheUtility = require('@global/utilities/cache');

const ONE_HOUR_MS = 60 * 60 * 1000;
const spotifyTokenCache = cacheUtility(ONE_HOUR_MS);

const get_access_token = async () => {
  const cachedToken = spotifyTokenCache.get('token', 'spotify');
  if (cachedToken) return cachedToken;

  const authString = Buffer.from(`${env.spotify.clientId}:${env.spotify.clientSecret}`).toString('base64');

  try {
    const response = await axios.post(
      'https://accounts.spotify.com/api/token',
      'grant_type=client_credentials',
      {
        headers: {
          'Authorization': `Basic ${authString}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    const token = response.data.access_token;
    spotifyTokenCache.set('token', token, 'spotify');
    return token;
  } catch (error) {
    await handleErrorUtility('Failed to get Spotify access token:', error.response?.data || error.message);
  }
};

module.exports = get_access_token;
