const axios = require('axios');

const twitchUserCache = new Map();

async function handleUserUtility(username, clientId, accessToken) {
  if (twitchUserCache.has(username)) {
    return twitchUserCache.get(username);
  }

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
      twitchUserCache.set(username, user);
      return user;
    }
  } catch (err) {
    console.warn(`Failed to fetch Twitch user for ${username}: ${err.message}`);
  }

  return null;
}

function handleUserCacheClearUtility() {
  twitchUserCache.clear();
}

module.exports = {
  handleUserUtility,
  handleUserCacheClearUtility,
};
