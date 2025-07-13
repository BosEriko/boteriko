const axios = require('axios');
const { broadcastToClient } = require('@global/utilities/websocket');
const env = require('@global/utilities/env');
const state = require('@global/utilities/state');
const handleErrorUtility = require('@global/utilities/error');
const cacheUtility = require('@global/utilities/cache');

const channelName = `#${env.twitch.channel.username}`;

// ------------------------------------------ API Variables ----------------------------------------
const TODOIST_API_URL = 'https://api.todoist.com/rest/v2';
const QUICK_ADD_URL = 'https://api.todoist.com/sync/v9/quick/add';
const TODOIST_HEADERS = { Authorization: `Bearer ${env.todoist.apiToken}` };

// ----------------------------------- Label Creation or Fetching ----------------------------------
const labelNameCache = cacheUtility();

function getKebabCaseLabel() {
  return (state.streamDetail?.game_name || 'general').toLowerCase().replace(/[^\w\s]/g, '').replace(/\s+/g, '-');
}

async function getOrCreateLabelName(maxRetries = 5, delayMs = 300) {
  const labelName = getKebabCaseLabel();

  const cachedLabel = labelNameCache.get(labelName, 'label-name');
  if (cachedLabel) return cachedLabel;

  try {
    const res = await axios.get(`${TODOIST_API_URL}/labels`, { headers: TODOIST_HEADERS });

    const existing = res.data.find((label) => label.name.toLowerCase() === labelName.toLowerCase());

    if (existing) {
      labelNameCache.set(labelName, labelName, 'label-name');
      return labelName;
    }

    await axios.post(`${TODOIST_API_URL}/labels`, { name: labelName }, { headers: TODOIST_HEADERS });

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      await new Promise((res) => setTimeout(res, delayMs));

      const confirm = await axios.get(`${TODOIST_API_URL}/labels`, {
        headers: TODOIST_HEADERS,
      });

      const confirmed = confirm.data.find(
        (label) => label.name.toLowerCase() === labelName.toLowerCase()
      );

      if (confirmed) {
        labelNameCache.set(labelName, labelName, 'label-name');
        return labelName;
      }
    }

    return null;
  } catch (err) {
    await handleErrorUtility("Failed to get/create label:", err);
    return null;
  }
}

// ------------------------------------------ Todo Fetching ----------------------------------------
async function fetchTodos() {
  const labelName = await getOrCreateLabelName();
  if (!labelName) return [];

  try {
    const res = await axios.get(`${TODOIST_API_URL}/tasks`, {
      headers: TODOIST_HEADERS,
      params: { filter: `@${labelName}&today` },
    });

    return res.data;
  } catch (err) {
    await handleErrorUtility("Failed to fetch todos:", err);
    return [];
  }
}

// --------------------------------------- Broadcast to Client -------------------------------------
async function broadcastTodoState() {
  try {
    const todos = await fetchTodos();
    broadcastToClient({
      type: 'TODO',
      todos,
      isVisible: state.isTodoVisible,
    });
  } catch (err) {
    await handleErrorUtility("Failed to broadcast todo state:", err);
  }
}

// --------------------------------------------- Add Todo ------------------------------------------
async function addTodo(client, task) {
  try {
    state.isTodoVisible = true;

    if (!task) {
      client.say(channelName, 'Please provide a task: !todo add <task>');
      return;
    }

    const labelName = await getOrCreateLabelName();
    if (!labelName) {
      client.say(channelName, 'Could not verify label creation ❌');
      return;
    }

    const content = `${task} @${labelName}`;
    await axios.post(
      QUICK_ADD_URL,
      { text: content, due_string: "today" },
      { headers: TODOIST_HEADERS }
    );

    await broadcastTodoState();
    client.say(channelName, `Added task to "${state.streamDetail?.game_name}": "${task}" ✅`);
  } catch (err) {
    await handleErrorUtility("Failed to add todo:", err);
    client.say(channelName, 'Failed to add the todo ❌');
  }
}

// -------------------------------------------- Count Todo -----------------------------------------
async function countTodos(client) {
  try {
    const todos = await fetchTodos();
    client.say(channelName, `Total Todos for "${state.streamDetail?.game_name}": ${todos.length} ✅`);
  } catch (err) {
    await handleErrorUtility("Failed to count todos:", err);
    client.say(channelName, 'Failed to count todos ❌');
  }
}

// --------------------------------------------- Read Todo -----------------------------------------
async function readTodo(client, indexStr) {
  try {
    state.isTodoVisible = true;
    const todos = await fetchTodos();
    const index = parseInt(indexStr, 10) - 1;

    if (isNaN(index) || index < 0 || index >= todos.length) {
      client.say(channelName, 'Invalid task number. Usage: !todo read <number>');
      return;
    }

    const todo = todos[index];
    client.say(channelName, `Todo #${index + 1}: ${todo.content} ✅`);
    await broadcastTodoState();
  } catch (err) {
    await handleErrorUtility("Failed to read todo:", err);
    client.say(channelName, 'Failed to read the todo ❌');
  }
}

// -------------------------------------------- Check Todo -----------------------------------------
async function checkTodo(client, indexStr) {
  try {
    state.isTodoVisible = true;
    const todos = await fetchTodos();
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
    await handleErrorUtility("Failed to check todo:", err);
    client.say(channelName, 'Failed to mark the todo as done ❌');
  }
}

// -------------------------------------------- Hide Todo ------------------------------------------
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
async function handleTodoCommand(client, message) {
  if (!state.isStreaming) {
    client.say(channelName, 'Todo commands are only available while streaming 📺');
    return;
  }

  const args = message.trim().split(' ');
  const subcommand = args[0];
  const rest = args.slice(1).join(' ');

  try {
    switch (subcommand) {
      case 'add':
        await addTodo(client, rest);
        break;
      case 'check':
        await checkTodo(client, args[1]);
        break;
      case 'count':
        await countTodos(client);
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
    await handleErrorUtility("Something went wrong while handling the todo command:", err);
    client.say(channelName, 'An error occurred while handling the todo command ❌');
  }
}

module.exports = handleTodoCommand;
