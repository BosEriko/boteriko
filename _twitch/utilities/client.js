const tmi = require("tmi.js");

const client = new tmi.Client({
  identity: {
    username: env.twitch.bot.username,
    password: env.twitch.bot.accessToken
  },
  channels: [env.twitch.channel.username]
});

module.exports = client;