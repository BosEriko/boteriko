// Concerns
const Concern = require("@controller/concerns");

// Controllers
const Music = require("@controller/Music");
const Twitch = require("@controller/Twitch");

const Controller = {
  Concern,
  Music,
  Twitch,
}

module.exports = Controller;