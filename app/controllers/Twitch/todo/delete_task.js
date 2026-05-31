const axios = require('axios');
const read_list = require("./read_list");
const broadcast_todo = require("./broadcast_todo");

const TODOIST_HEADERS = { Authorization: `Bearer ${Config.other.todoist.apiToken}` };
const channelName = `#${Config.twitch.channel.username}`;

async function delete_task(client, indexStr) {
  try {
    const todos = await read_list();
    const index = parseInt(indexStr, 10) - 1;

    if (isNaN(index) || index < 0 || index >= todos.length) {
      client.say(channelName, 'Invalid task number. Usage: !todo check <number>');
      return;
    }

    const todo = todos[index];

    await axios.post(`https://api.todoist.com/api/v1/tasks/${todo.id}/close`, null, { headers: TODOIST_HEADERS });

    await broadcast_todo();
    client.say(channelName, `Marked task ${index + 1} as done ✅`);
  } catch (err) {
    await Utility.error_logger("Failed to check todo:", err);
    client.say(channelName, 'Failed to mark the todo as done ❌');
  }
}

module.exports = delete_task;
