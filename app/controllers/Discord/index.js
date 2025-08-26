const authentication_callback = require("./authentication_callback");
const authentication_connect = require("./authentication_connect");
const disconnect = require("./disconnect");

const Discord = {
  authentication_callback,
  authentication_connect,
  disconnect,
};

module.exports = Discord;