const axios = require('axios');
const env = require('@config/environments/base');
const Utility = require("@utility");;
const cacheUtility = require('@global/utilities/cache');

// ------------------------------------------ API Variables ----------------------------------------
const TODOIST_API_URL = 'https://api.todoist.com/rest/v2';
const QUICK_ADD_URL = 'https://api.todoist.com/sync/v9/quick/add';
const TODOIST_HEADERS = { Authorization: `Bearer ${env.other.todoist.apiToken}` };

// ----------------------------------- Label Creation or Fetching ----------------------------------
const labelNameCache = cacheUtility();

async function getOrCreateLabelName(maxRetries = 5, delayMs = 300) {
  const labelName = 'discord';

  const cachedLabel = labelNameCache.get(labelName, 'label-name');
  if (cachedLabel) return cachedLabel;

  try {
    const res = await axios.get(`${TODOIST_API_URL}/labels`, { headers: TODOIST_HEADERS });

    const existing = res.data.find(label => label.name.toLowerCase() === labelName);
    if (existing) {
      labelNameCache.set(labelName, labelName, 'label-name');
      return labelName;
    }

    await axios.post(`${TODOIST_API_URL}/labels`, { name: labelName }, { headers: TODOIST_HEADERS });

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      await new Promise(res => setTimeout(res, delayMs));
      const confirm = await axios.get(`${TODOIST_API_URL}/labels`, { headers: TODOIST_HEADERS });
      const confirmed = confirm.data.find(label => label.name.toLowerCase() === labelName);
      if (confirmed) {
        labelNameCache.set(labelName, labelName, 'label-name');
        return labelName;
      }
    }

    return null;
  } catch (err) {
    await Utility.error_logger('Failed to get/create label:', err);
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
      params: { filter: `@${labelName}` },
    });

    return res.data;
  } catch (err) {
    await Utility.error_logger('Failed to fetch todos:', err);
    return [];
  }
}

// --------------------------------------------- Add Todo ------------------------------------------
async function addTodo(task) {
  try {
    if (!task) return 'Please provide a task: !todo add <task>';

    const labelName = await getOrCreateLabelName();
    if (!labelName) return 'Could not verify label creation ❌';

    const content = `${task} @${labelName}`;
    await axios.post(QUICK_ADD_URL, { text: content }, { headers: TODOIST_HEADERS });

    return `Added task: "${task}" ✅`;
  } catch (err) {
    await Utility.error_logger('Failed to add todo:', err);
    return 'Failed to add the todo ❌';
  }
}

// -------------------------------------------- Count Todo -----------------------------------------
async function countTodos() {
  try {
    const todos = await fetchTodos();
    return `Total Todos: ${todos.length} ✅`;
  } catch (err) {
    await Utility.error_logger('Failed to count todos:', err);
    return 'Failed to count todos ❌';
  }
}

// --------------------------------------------- Read Todo -----------------------------------------
async function readTodo(indexStr) {
  try {
    const todos = await fetchTodos();
    const index = parseInt(indexStr, 10) - 1;

    if (isNaN(index) || index < 0 || index >= todos.length) {
      return 'Invalid task number. Usage: !todo read <number>';
    }

    const todo = todos[index];
    return `Todo #${index + 1}: ${todo.content} ✅`;
  } catch (err) {
    await Utility.error_logger('Failed to read todo:', err);
    return 'Failed to read the todo ❌';
  }
}

// -------------------------------------------- Check Todo -----------------------------------------
async function checkTodo(indexStr) {
  try {
    const todos = await fetchTodos();
    const index = parseInt(indexStr, 10) - 1;

    if (isNaN(index) || index < 0 || index >= todos.length) {
      return 'Invalid task number. Usage: !todo check <number>';
    }

    const todo = todos[index];

    await axios.post(`${TODOIST_API_URL}/tasks/${todo.id}/close`, null, { headers: TODOIST_HEADERS });

    return `Marked task ${index + 1} as done ✅`;
  } catch (err) {
    await Utility.error_logger('Failed to check todo:', err);
    return 'Failed to mark the todo as done ❌';
  }
}

// -------------------------------------------- Show Todo ------------------------------------------
async function showTodos() {
  try {
    const todos = await fetchTodos();
    if (todos.length === 0) {
      return 'No todos at the moment 📭';
    }

    const displayed = todos.slice(0, 5);
    let message = "\n";
    message += displayed.map((todo, i) => `${i + 1}. ${todo.content}`).join('\n');

    const remaining = todos.length - displayed.length;
    if (remaining > 0) message += `\n...and ${remaining} more`;

    return message;
  } catch (err) {
    await Utility.error_logger('Failed to show todos:', err);
    return 'Failed to show todos ❌';
  }
}

// --------------------------------------------- Commands ------------------------------------------
async function handleTodoCommand(message) {
  const args = message.trim().split(' ');
  const subcommand = args[0];
  const rest = args.slice(1).join(' ');

  try {
    switch (subcommand) {
      case 'add':
        return await addTodo(rest);
      case 'check':
        return await checkTodo(args[1]);
      case 'count':
        return await countTodos();
      case 'read':
        return await readTodo(args[1]);
      case 'show':
        return await showTodos();
      default:
        return 'Usage: !todo [read|add|check|count|show]';
    }
  } catch (err) {
    await Utility.error_logger('Something went wrong while handling the todo command:', err);
    return 'An error occurred while handling the todo command ❌';
  }
}

module.exports = handleTodoCommand;
