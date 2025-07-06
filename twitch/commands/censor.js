const { broadcastToClient } = require('@global/utilities/websocket');

function handleCensorCommand(client, channel) {
  const timestamp = Date.now();
  client.say(channel, "Toggling censorship settings in the overlay...");
  broadcastToClient({ type: 'CENSOR', timestamp });
}

module.exports = handleCensorCommand;