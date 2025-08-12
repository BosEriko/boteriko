const create_custom_reward = require("./create_custom_reward");
const create_custom_rewards = require("./create_custom_rewards");
const create_schedule = require("./create_schedule");
const delete_channel_request = require("./delete_channel_request");
const delete_schedule = require("./delete_schedule");
const read_category_id_by_name = require("./read_category_id_by_name");
const read_schedule = require("./read_schedule");
const update_game = require("./update_game");
const update_schedule = require("./update_schedule");

const Twitch = {
  create_custom_reward,
  create_custom_rewards,
  create_schedule,
  delete_channel_request,
  delete_schedule,
  read_category_id_by_name,
  read_schedule,
  update_game,
  update_schedule,
};

module.exports = Twitch;
