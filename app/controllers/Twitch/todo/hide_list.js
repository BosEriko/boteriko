const { state } = require('@global/utilities/state');
const broadcast_todo = require("./broadcast_todo");

const channelName = `#${Config.twitch.channel.username}`;

function hide_list(client) {
  try {
    state.isTodoVisible = false;
    broadcast_todo();
    client.say(channelName, 'Todo list hidden 👀');
  } catch (err) {
    handleErrorUtility("Failed to hide todos:", err);
    client.say(channelName, 'Failed to hide todos ❌');
  }
}

module.exports = hide_list;
