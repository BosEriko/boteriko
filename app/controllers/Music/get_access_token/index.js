const axios = require('axios');
const cacheUtility = require('@global/utilities/cache');

const ONE_HOUR_MS = 60 * 60 * 1000;
const spotifyTokenCache = cacheUtility(ONE_HOUR_MS);

const get_access_token = async () => {
  const cachedToken = spotifyTokenCache.get('token', 'spotify');
  if (cachedToken) return cachedToken;

  const authString = Buffer.from(`${env.other.spotify.clientId}:${env.other.spotify.clientSecret}`).toString('base64');

  try {
    const params = new URLSearchParams();
    params.append('grant_type', 'refresh_token');
    params.append('refresh_token', env.other.spotify.refreshToken);

    const response = await axios.post(
      'https://accounts.spotify.com/api/token',
      params.toString(),
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
    await Utility.error_logger('Failed to refresh Spotify access token:', error.response?.data || error.message);
  }
};

module.exports = get_access_token;
