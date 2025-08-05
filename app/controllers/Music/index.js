const add_to_queue = require("./add_to_queue");
const get_access_token = require("./get_access_token");
const pause = require("./pause");
const play = require("./play");

const Music = {
  add_to_queue,
  get_access_token,
  pause,
  play,
};

module.exports = Music;