const add_to_queue = require("./add_to_queue");
const authentication_callback = require("./authentication_callback");
const authentication_login = require("./authentication_login");
const get_access_token = require("./get_access_token");
const pause = require("./pause");
const play = require("./play");
const polling = require("./polling");

const Music = {
  add_to_queue,
  authentication_callback,
  authentication_login,
  get_access_token,
  pause,
  play,
  polling,
};

module.exports = Music;