const { state } = require('@global/utilities/state');
const broadcast_todo = require("./broadcast_todo");

const channelName = `#${Config.twitch.channel.username}`;

function show_list(client) {
  try {
    state.isTodoVisible = true;
    broadcast_todo();
    client.say(channelName, 'Todo list visible 📋');
  } catch (err) {
    handleErrorUtility("Failed to show todos:", err);
    client.say(channelName, 'Failed to show todos ❌');
  }
}

module.exports = show_list;
