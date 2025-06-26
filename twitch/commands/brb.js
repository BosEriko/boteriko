const { broadcastToClient } = require('@global/utilities/websocket');

function toTitleCase(str) {
  return str.replace(/\w\S*/g, function(word) {
    return word.charAt(0).toUpperCase() + word.slice(1);
  });
}

function handleBrbCommand(client, channel, prompt) {
  if (prompt) {
    client.say(channel, `Be right back! ${toTitleCase(prompt) || ""}`);
    broadcastToClient({ type: 'BRB_COMMAND', message: prompt, isVisible: true });
  } else {
    client.say(channel, "Welcome back!");
    broadcastToClient({ type: 'BRB_COMMAND', message: null, isVisible: false });
  }
}

module.exports = handleBrbCommand;