const axios = require('axios');

const twitchUserCache = new Map();
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

function getCacheKey(username) {
  return `twitch-${username}`;
}

function cacheTwitchUser(username, userData) {
  const expiresAt = Date.now() + CACHE_TTL_MS;
  twitchUserCache.set(getCacheKey(username), { userData, expiresAt });
}

function getCachedTwitchUser(username) {
  const cached = twitchUserCache.get(getCacheKey(username));
  if (cached && cached.expiresAt > Date.now()) {
    return cached.userData;
  }
  twitchUserCache.delete(getCacheKey(username));
  return null;
}

async function handleUserUtility(username, clientId, accessToken) {
  const cachedUser = getCachedTwitchUser(username);
  if (cachedUser) return cachedUser;

  try {
    const res = await axios.get('https://api.twitch.tv/helix/users', {
      headers: {
        'Client-ID': clientId,
        'Authorization': `Bearer ${accessToken}`,
      },
      params: { login: username },
    });

    const user = res.data.data[0];
    if (user) {
      cacheTwitchUser(username, user);
      return user;
    }
  } catch (err) {
    console.warn(`Failed to fetch Twitch user for ${username}: ${err.message}`);
  }

  return null;
}

module.exports = handleUserUtility;
