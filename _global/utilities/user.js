const axios = require('axios');
const cacheUtility = require('@global/utilities/cache');

const twitchUserCache = cacheUtility();

async function handleUserUtility(identifier) {
  const isId = /^\d+$/.test(identifier);

  const cacheKey = isId ? `id:${identifier}` : `username:${identifier}`;
  const cachedUser = twitchUserCache.get(cacheKey, 'twitch-user');
  if (cachedUser) return cachedUser;

  try {
    const res = await axios.get('https://api.twitch.tv/helix/users', {
      headers: {
        'Client-ID': Config.twitch.bot.clientId,
        'Authorization': `Bearer ${Config.twitch.bot.accessToken}`,
      },
      params: isId ? { id: identifier } : { login: identifier },
    });

    const user = res.data.data[0];
    if (user) {
      twitchUserCache.set(cacheKey, user, 'twitch-user');
      return user;
    }
  } catch (err) {
    console.warn(`Failed to fetch Twitch user for ${identifier}: ${err.message}`);
  }

  return null;
}

module.exports = handleUserUtility;
