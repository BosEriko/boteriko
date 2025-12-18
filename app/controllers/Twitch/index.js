const authentication_callback = require("./authentication_callback");
const authentication_login = require("./authentication_login");
const auto_raid = require("./auto_raid");
const create_custom_reward = require("./create_custom_reward");
const create_custom_rewards = require("./create_custom_rewards");
const create_schedule = require("./create_schedule");
const delete_schedule = require("./delete_schedule");
const read_category_id_by_name = require("./read_category_id_by_name");
const read_schedule = require("./read_schedule");
const update_channel_request = require("./update_channel_request");
const update_game = require("./update_game");
const update_schedule = require("./update_schedule");
const update_title = require("./update_title");

const Twitch = {
  authentication_callback,
  authentication_login,
  auto_raid,
  create_custom_reward,
  create_custom_rewards,
  create_schedule,
  delete_schedule,
  read_category_id_by_name,
  read_schedule,
  update_channel_request,
  update_game,
  update_schedule,
  update_title,
};

module.exports = Twitch;
