const { broadcastToClient } = require('@global/utilities/websocket');
const state = require('@global/utilities/state');

function handleRaidCommand(client, message) {
  if (!state.isStreaming) {
    client.say(channelName, 'Raid command is only available while streaming 📺');
    return;
  }
}

module.exports = handleRaidCommand;