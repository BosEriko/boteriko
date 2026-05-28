const { broadcastToClient } = require('@global/utilities/websocket');

function handleCensorCommand(client, channel) {
  const timestamp = Date.now();
  client.say(channel, "Censorship Toggled");
  broadcastToClient({ type: 'CENSOR', timestamp });
}

module.exports = handleCensorCommand;