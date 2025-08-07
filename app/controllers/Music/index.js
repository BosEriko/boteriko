const add_to_queue = require("./add_to_queue");
const get_access_token = require("./get_access_token");
const get_account_information = require("./get_account_information");
const get_refresh_token = require("./get_refresh_token");
const pause = require("./pause");
const play = require("./play");

const Music = {
  add_to_queue,
  get_access_token,
  get_account_information,
  get_refresh_token,
  pause,
  play,
};

module.exports = Music;