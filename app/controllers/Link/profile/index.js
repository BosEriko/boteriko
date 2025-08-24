const platform_router = require("../../concerns/platform_router");

const twitch = (user, mention = null) => {
  const username = mention.trim() ? mention.trim().split(' ')[0].replace(/^<@!?(\d+)>$/, '$1').replace(/^@/, '') : null;
  console.log(user['user-id'], user['display-name']);
  if (username) {
    return `Welcome to Twitch, ${username}`;
  } else {
    return `Welcome to Twitch`;
  }
}

const discord = (user, mention = null) => {
  const userId = mention.trim() ? mention.trim().split(' ')[0].replace(/^<@!?(\d+)>$/, '$1').replace(/^@/, '') : null;
  console.log(user.id, user.globalName);
  if (userId) {
    return `Welcome to Discord, ${userId}`;
  } else {
    return `Welcome to Discord`;
  }
}

const profile = platform_router({ twitch, discord });

module.exports = profile;
