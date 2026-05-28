const tmi = require("tmi.js");

const client = new tmi.Client({
  identity: {
    username: Config.twitch.bot.username,
    password: Config.twitch.bot.accessToken
  },
  channels: [Config.twitch.channel.username]
});

module.exports = client;