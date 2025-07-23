const { broadcastToClient } = require('@global/utilities/websocket');

function handleBackCommand(client, channel) {
  client.say(channel, "Welcome back!");
  broadcastToClient({ type: 'TICKER', message: null, isVisible: false });
  broadcastToClient({ type: 'MUSIC', id: null, isVisible: false });
}

module.exports = handleBackCommand;