const { broadcastToClient } = require('@global/utilities/websocket');

function toTitleCase(str) {
  return str.replace(/\w\S*/g, function(word) {
    return word.charAt(0).toUpperCase() + word.slice(1);
  });
}

function handleBrbCommand(client, channel, prompt) {
  if (prompt) {
    client.say(channel, `Be right back! ${toTitleCase(prompt) || ""}`);
    broadcastToClient({
      type: 'SCREENSAVER',
      ticker: {
        message: prompt,
        isVisible: true
      },
      music: {
        id: 'THE_GRAND_AFFAIR_COUPE',
        isPlaying: true
      }
    });
  } else {
    client.say(channel, "Please provide a message: !brb <message>");
  }
}

module.exports = handleBrbCommand;