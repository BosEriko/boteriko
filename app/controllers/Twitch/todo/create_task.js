const axios = require('axios');
const { state } = require('@global/utilities/state');
const read_label = require("./read_label");
const broadcast_todo = require("./broadcast_todo");

const TODOIST_HEADERS = { Authorization: `Bearer ${Config.other.todoist.apiToken}` };
const channelName = `#${Config.twitch.channel.username}`;

async function create_task(client, task) {
  try {
    if (!task) {
      client.say(channelName, 'Please provide a task: !todo add <task>');
      return;
    }

    const labelName = await read_label();
    if (!labelName) {
      client.say(channelName, 'Could not verify label creation ❌');
      return;
    }

    const content = `${task} today @${labelName}`;
    await axios.post("https://api.todoist.com/api/v1/tasks/quick", { text: content }, { headers: TODOIST_HEADERS });

    state.isTodoVisible = true;
    await broadcast_todo();
    client.say(channelName, `Added task to "${labelName}": "${task}" ✅`);
  } catch (err) {
    await Utility.error_logger("Failed to add todo:", err);
    client.say(channelName, 'Failed to add the todo ❌');
  }
}

module.exports = create_task;
