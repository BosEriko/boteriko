const axios = require('axios');
const { broadcastToClient } = require('@global/utilities/websocket');
const env = require('@global/utilities/env');
const state = require('@global/utilities/state');
const handleErrorUtility = require('@global/utilities/error');

const TODOIST_API_URL = 'https://api.todoist.com/rest/v2/tasks';
const TODOIST_LABELS_URL = 'https://api.todoist.com/rest/v2/labels';

const TODOIST_HEADERS = {
  Authorization: `Bearer ${env.todoist.apiToken}`,
};

const channelName = `#${env.twitch.channel.username}`;

async function ensureGameLabelExists() {
  const game = state.streamDetail?.game_name;
  if (!game) return null;

  const label = game.trim().replace(/\s+/g, '-').toLowerCase();

  try {
    const labelRes = await axios.get(TODOIST_LABELS_URL, { headers: TODOIST_HEADERS });
    const existing = labelRes.data.find(l => l.name.toLowerCase() === label);

    if (existing) return label;

    await axios.post(TODOIST_LABELS_URL, { name: label }, { headers: TODOIST_HEADERS });
    return label;
  } catch (err) {
    await handleErrorUtility("Failed to ensure game label exists:", err);
    return null;
  }
}

async function fetchTodos() {
  try {
    const game = state.streamDetail?.game_name;
    if (!game) return [];

    const label = await ensureGameLabelExists();
    if (!label) return [];

    const url = `${TODOIST_API_URL}?labels=[${label}]`;
    const res = await axios.get(url, { headers: TODOIST_HEADERS });

    return res.data;
  } catch (err) {
    await handleErrorUtility("Failed to fetch todos:", err);
    return [];
  }
}

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
    const status = todo.is_completed ? '✅' : '📝';
    client.say(channelName, `Todo #${index + 1}: ${todo.content} ${status}`);
    await broadcastTodoState();
  } catch (err) {
    await handleErrorUtility("Failed to read todo:", err);
    client.say(channelName, 'Failed to read the todo ❌');
  }
}

async function addTodo(client, task) {
  try {
    state.isTodoVisible = true;
    if (!task) {
      client.say(channelName, 'Please provide a task: !todo add <task>');
      return;
    }

    const game = state.streamDetail?.game_name;
    if (!game) {
      client.say(channelName, 'Cannot add task without an active game 🕹️');
      return;
    }

    const label = await ensureGameLabelExists();
    if (!label) {
      client.say(channelName, 'Failed to find or create game label ❌');
      return;
    }

    await axios.post(
      TODOIST_API_URL,
      {
        content: task,
        labels: [label],
      },
      { headers: TODOIST_HEADERS }
    );

    await broadcastTodoState();
    client.say(channelName, `Added task for ${game}: "${task}" ✅`);
  } catch (err) {
    await handleErrorUtility("Failed to add todo:", err);
    client.say(channelName, 'Failed to add the todo ❌');
  }
}

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
    await axios.post(`${TODOIST_API_URL}/${todo.id}/close`, null, {
      headers: TODOIST_HEADERS,
    });

    await broadcastTodoState();
    client.say(channelName, `Marked task ${index + 1} as done ✅`);
  } catch (err) {
    await handleErrorUtility("Failed to check todo:", err);
    client.say(channelName, 'Failed to mark the todo as done ❌');
  }
}

async function deleteTodo(client, indexStr) {
  try {
    state.isTodoVisible = true;
    const todos = await fetchTodos();
    const index = parseInt(indexStr, 10) - 1;
    if (isNaN(index) || index < 0 || index >= todos.length) {
      client.say(channelName, 'Invalid task number. Usage: !todo delete <number>');
      return;
    }

    const todo = todos[index];
    await axios.delete(`${TODOIST_API_URL}/${todo.id}`, { headers: TODOIST_HEADERS });

    await broadcastTodoState();
    client.say(channelName, `Deleted task: "${todo.content}" 🗑️`);
  } catch (err) {
    await handleErrorUtility("Failed to delete todo:", err);
    client.say(channelName, 'Failed to delete the todo ❌');
  }
}

async function countTodos(client) {
  try {
    const todos = await fetchTodos();
    const done = todos.filter(t => t.is_completed).length;
    const total = todos.length;
    client.say(channelName, `Todo progress: ${done}/${total} ✅`);
  } catch (err) {
    await handleErrorUtility("Failed to count todos:", err);
    client.say(channelName, 'Failed to count todos ❌');
  }
}

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

async function handleTodoCommand(client, message) {
  if (!state.isStreaming || !state.streamDetail || !state.streamDetail.game_name) {
    client.say(channelName, 'Todo commands are only available while streaming a game 🎮');
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
      case 'delete':
        await deleteTodo(client, args[1]);
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
        client.say(channelName, 'Usage: !todo [read|add|check|delete|count|hide|show]');
    }
  } catch (err) {
    await handleErrorUtility("Something went wrong while handling the todo command:", err);
    client.say(channelName, 'An error occurred while handling the todo command ❌');
  }
}

module.exports = handleTodoCommand;
