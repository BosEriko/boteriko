const { broadcastToClient } = require('@global/utilities/websocket');

function handleBackCommand(client, channel) {
  client.say(channel, "Welcome back!");
  broadcastToClient({
    type: 'SCREENSAVER',
    ticker: {
      message: null,
      isVisible: false
    },
    music: {
      id: null,
      isPlaying: false
    }
  });
}

module.exports = handleBackCommand;