const read_list = require("./read_list");
const broadcast_todo = require("./broadcast_todo");

const channelName = `#${Config.twitch.channel.username}`;

async function read_task(client, indexStr) {
  try {
    const todos = await read_list();
    const index = parseInt(indexStr, 10) - 1;

    if (isNaN(index) || index < 0 || index >= todos.length) {
      client.say(channelName, 'Invalid task number. Usage: !todo read <number>');
      return;
    }

    const todo = todos[index];
    client.say(channelName, `Todo #${index + 1}: ${todo.content} ✅`);
    await broadcast_todo();
  } catch (err) {
    await Utility.error_logger("Failed to read todo:", err);
    client.say(channelName, 'Failed to read the todo ❌');
  }
}

module.exports = read_task;
