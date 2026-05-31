const axios = require('axios');
const cacheUtility = require('@global/utilities/cache');

const { broadcastToClient } = require('@global/utilities/websocket');
const { state } = require('@global/utilities/state');
const channelName = `#${Config.twitch.channel.username}`;
const { kebabCase } = require('change-case');

// ------------------------------------------ API Variables ----------------------------------------
const TODOIST_API_URL = 'https://api.todoist.com/rest/v2';
const TODOIST_HEADERS = { Authorization: `Bearer ${Config.other.todoist.apiToken}` };

// ----------------------------------- Label Creation or Fetching ----------------------------------
const labelNameCache = cacheUtility();

async function read_label() {
  const labelName = state.streamDetail?.game_name || "general";

  const cachedLabel = labelNameCache.get(labelName, 'label-name');
  if (cachedLabel) return cachedLabel;

  try {
    const searchLabel = await axios.get(`https://api.todoist.com/api/v1/labels/search?query=${labelName}&limit=1`, { headers: TODOIST_HEADERS });

    const existing = searchLabel.data.results?.[0]?.name;

    if (existing) {
      labelNameCache.set(labelName, labelName, 'label-name');
      return labelName;
    }

    const createLabel = await axios.post(`https://api.todoist.com/api/v1/labels`, { name: labelName }, { headers: TODOIST_HEADERS });

    if (createLabel.statusText === "OK") {
      labelNameCache.set(labelName, labelName, 'label-name');
      return labelName;
    }

    return null;
  } catch (err) {
    await Utility.error_logger("Failed to get/create label:", err);
    return null;
  }
}

// ------------------------------------------ Todo Fetching ----------------------------------------
async function read_todos() {
  const labelName = await read_label();

  try {
    const tasks = await axios.get('https://api.todoist.com/api/v1/tasks/filter', {
      params: { query: `today & @${labelName}` },
      headers: TODOIST_HEADERS
    });

    return tasks.data.results;
  } catch (err) {
    await Utility.error_logger("Failed to fetch todos:", err);
    return [];
  }
}

// --------------------------------------- Broadcast to Client -------------------------------------
// TODO: FIX
async function broadcastTodoState() {
  try {
    const todos = await read_todos();
    broadcastToClient({
      type: 'TODO',
      todos,
      isVisible: state.isTodoVisible,
    });
  } catch (err) {
    await Utility.error_logger("Failed to broadcast todo state:", err);
  }
}

// --------------------------------------------- Add Todo ------------------------------------------
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

    await broadcastTodoState();
    client.say(channelName, `Added task to "${state.streamDetail?.game_name}": "${task}" ✅`);
  } catch (err) {
    await Utility.error_logger("Failed to add todo:", err);
    client.say(channelName, 'Failed to add the todo ❌');
  }
}

// -------------------------------------------- Count Todo -----------------------------------------
async function count_todo(client) {
  try {
    const todos = await read_todos();
    client.say(channelName, `Total Todos for "${state.streamDetail?.game_name || 'general'}": ${todos.length} ✅`);
  } catch (err) {
    await Utility.error_logger("Failed to count todos:", err);
    client.say(channelName, 'Failed to count todos ❌');
  }
}

// --------------------------------------------- Read Todo -----------------------------------------
// TODO: FIX
async function readTodo(client, indexStr) {
  try {
    const todos = await read_todos();
    const index = parseInt(indexStr, 10) - 1;

    if (isNaN(index) || index < 0 || index >= todos.length) {
      client.say(channelName, 'Invalid task number. Usage: !todo read <number>');
      return;
    }

    const todo = todos[index];
    client.say(channelName, `Todo #${index + 1}: ${todo.content} ✅`);
    await broadcastTodoState();
  } catch (err) {
    await Utility.error_logger("Failed to read todo:", err);
    client.say(channelName, 'Failed to read the todo ❌');
  }
}

// -------------------------------------------- Check Todo -----------------------------------------
// TODO: FIX
async function checkTodo(client, indexStr) {
  try {
    const todos = await read_todos();
    const index = parseInt(indexStr, 10) - 1;

    if (isNaN(index) || index < 0 || index >= todos.length) {
      client.say(channelName, 'Invalid task number. Usage: !todo check <number>');
      return;
    }

    const todo = todos[index];

    await axios.post(`${TODOIST_API_URL}/tasks/${todo.id}/close`, null, { headers: TODOIST_HEADERS });

    await broadcastTodoState();
    client.say(channelName, `Marked task ${index + 1} as done ✅`);
  } catch (err) {
    await Utility.error_logger("Failed to check todo:", err);
    client.say(channelName, 'Failed to mark the todo as done ❌');
  }
}

// -------------------------------------------- Hide Todo ------------------------------------------
// TODO: FIX
function hideTodos(client) {
  try {
    state.isTodoVisible = false;
    broadcastTodoState();
    client.say(channelName, 'Todo list hidden 👀');
  } catch (err) {
    handleErrorUtility("Failed to hide todos:", err);
    client.say(channelName, 'Failed to hide todos ❌');
  }
}

// -------------------------------------------- Show Todo ------------------------------------------
// TODO: FIX
function showTodos(client) {
  try {
    state.isTodoVisible = true;
    broadcastTodoState();
    client.say(channelName, 'Todo list visible 📋');
  } catch (err) {
    handleErrorUtility("Failed to show todos:", err);
    client.say(channelName, 'Failed to show todos ❌');
  }
}

// --------------------------------------------- Commands ------------------------------------------
// TODO: FIX
async function handleTodoCommand(client, message) {
  const args = message.trim().split(' ');
  const subcommand = args[0];
  const rest = args.slice(1).join(' ');

  try {
    switch (subcommand) {
      case 'add':
        await create_task(client, rest);
        break;
      case 'check':
        await checkTodo(client, args[1]);
        break;
      case 'count':
        await count_todo(client);
        break;
      case 'hide':
        hideTodos(client);
        break;
      case 'show':
        showTodos(client);
        break;
      case 'read':
        await readTodo(client, args[1]);
        break;
      default:
        client.say(channelName, 'Usage: !todo [read|add|check|count|hide|show]');
    }
  } catch (err) {
    await Utility.error_logger("Something went wrong while handling the todo command:", err);
    client.say(channelName, 'An error occurred while handling the todo command ❌');
  }
}

module.exports = handleTodoCommand;
