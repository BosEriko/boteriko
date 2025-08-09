const axios = require('axios');
const cacheUtility = require('@global/utilities/cache');

const twitchUserCache = cacheUtility();

async function handleUserUtility(username) {
  const cachedUser = twitchUserCache.get(username, 'twitch-user');
  if (cachedUser) return cachedUser;

  try {
    const res = await axios.get('https://api.twitch.tv/helix/users', {
      headers: {
        'Client-ID': Config.twitch.bot.clientId,
        'Authorization': `Bearer ${Config.twitch.bot.accessToken}`,
      },
      params: { login: username },
    });

    const user = res.data.data[0];
    if (user) {
      twitchUserCache.set(username, user, 'twitch-user');
      return user;
    }
  } catch (err) {
    console.warn(`Failed to fetch Twitch user for ${username}: ${err.message}`);
  }

  return null;
}

module.exports = handleUserUtility;
