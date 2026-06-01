const get_achievement = require("./get_achievement");
const get_description = require("./get_description");
const get_game = require("./get_game");
const update_twitch = require("./update_twitch");
const verify_id = require("./verify_id");

const Steam = {
  get_achievement,
  get_description,
  get_game,
  update_twitch,
  verify_id,
};

module.exports = Steam;
