const { state } = require('@global/utilities/state');
const read_list = require("./read_list");

const channelName = `#${Config.twitch.channel.username}`;

async function count_tasks(client) {
  try {
    const todos = await read_list();
    client.say(channelName, `Total Todos for "${state.streamDetail?.game_name || 'general'}": ${todos.length} ✅`);
  } catch (err) {
    await Utility.error_logger("Failed to count todos:", err);
    client.say(channelName, 'Failed to count todos ❌');
  }
}

module.exports = count_tasks;
