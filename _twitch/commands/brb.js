const { broadcastToClient } = require('@global/utilities/websocket');

function toTitleCase(str) {
  return str.replace(/\w\S*/g, function(word) {
    return word.charAt(0).toUpperCase() + word.slice(1);
  });
}

function handleBrbCommand(client, channel, prompt) {
  if (prompt) {
    client.say(channel, `Be right back! ${toTitleCase(prompt) || ""}`);
    broadcastToClient({ type: 'TICKER', message: prompt, isVisible: true });
    broadcastToClient({ type: 'MUSIC', id: 'THE_GRAND_AFFAIR_COUPE', isVisible: true });
  } else {
    client.say(channel, "Please provide a message: !brb <message>");
  }
}

module.exports = handleBrbCommand;