const platform_router = require("../../concerns/platform_router");

const twitch = () => {
  return "TWITCH!";
}

const discord = () => {
  return "DISCORD!";
}

const profile = platform_router({ twitch, discord });

module.exports = profile;
