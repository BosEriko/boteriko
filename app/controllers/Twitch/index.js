const authentication_callback = require("./authentication_callback");
const authentication_login = require("./authentication_login");
const auto_raid = require("./auto_raid");
const create_clip = require("./create_clip");
const create_commercial = require("./create_commercial");
const create_custom_reward = require("./create_custom_reward");
const create_custom_rewards = require("./create_custom_rewards");
const create_raid = require("./create_raid");
const create_schedule = require("./create_schedule");
const delete_schedule = require("./delete_schedule");
const read_category_id_by_name = require("./read_category_id_by_name");
const read_schedule = require("./read_schedule");
const read_stream_details = require("./read_stream_details");
const read_users_id = require("./read_users_id");
const update_channel_request = require("./update_channel_request");
const update_game = require("./update_game");
const update_schedule = require("./update_schedule");
const update_title = require("./update_title");
const websocket = require("./websocket");

const Twitch = {
  authentication_callback,
  authentication_login,
  auto_raid,
  create_clip,
  create_commercial,
  create_custom_reward,
  create_custom_rewards,
  create_raid,
  create_schedule,
  delete_schedule,
  read_category_id_by_name,
  read_schedule,
  read_stream_details,
  read_users_id,
  update_channel_request,
  update_game,
  update_schedule,
  update_title,
  websocket,
};

module.exports = Twitch;
