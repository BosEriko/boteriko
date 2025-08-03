const axios = require('axios');
const env = require('@config/environments/base');
const state = require('@global/utilities/state');

async function handleUserUtility(username) {
  const cachedUser = state.twitchUsers.get(username);
  if (cachedUser) return cachedUser;

  try {
    const res = await axios.get('https://api.twitch.tv/helix/users', {
      headers: {
        'Client-ID': env.twitch.bot.clientId,
        'Authorization': `Bearer ${env.twitch.bot.accessToken}`,
      },
      params: { login: username },
    });

    const user = res.data.data[0];
    if (user) {
      state.twitchUsers.set(username, user);
      return user;
    }
  } catch (err) {
    console.warn(`Failed to fetch Twitch user for ${username}: ${err.message}`);
  }

  return null;
}

module.exports = handleUserUtility;
