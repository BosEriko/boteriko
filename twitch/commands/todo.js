const { broadcastToClient } = require('@global/utilities/websocket');
const env = require('@global/utilities/env');
const state = require('@global/utilities/state');

const channelName = `#${env.twitch.channel.username}`;

let todos = [];
let isVisible = true;

function broadcastTodoState() {
  broadcastToClient({
    type: 'TODO',
    todos,
    isVisible,
  });
}

function addTodo(client, task) {
  isVisible = true;
  if (!task) {
    client.say(channelName, 'Please provide a task: !todo add <task>');
    return;
  }

  todos.push({ todo: task, done: false });
  broadcastTodoState();
  client.say(channelName, `Added task: "${task}" ✅`);
}

function checkTodo(client, indexStr) {
  isVisible = true;
  const index = parseInt(indexStr, 10) - 1;
  if (isNaN(index) || index < 0 || index >= todos.length) {
    client.say(channelName, 'Invalid task number. Usage: !todo check <number>');
    return;
  }

  todos[index].done = true;
  broadcastTodoState();
  client.say(channelName, `Marked task ${index + 1} as done ✅`);
}

function deleteTodo(client, indexStr) {
  isVisible = true;
  const index = parseInt(indexStr, 10) - 1;
  if (isNaN(index) || index < 0 || index >= todos.length) {
    client.say(channelName, 'Invalid task number. Usage: !todo delete <number>');
    return;
  }

  const [removed] = todos.splice(index, 1);
  broadcastTodoState();
  client.say(channelName, `Deleted task: "${removed.todo}" 🗑️`);
}

function countTodos(client) {
  const done = todos.filter(t => t.done).length;
  const total = todos.length;
  client.say(channelName, `Todo progress: ${done}/${total} ✅`);
}

function hideTodos(client) {
  isVisible = false;
  broadcastTodoState();
  client.say(channelName, 'Todo list hidden 👀');
}

function showTodos(client) {
  isVisible = true;
  broadcastTodoState();
  client.say(channelName, 'Todo list visible 📋');
}

function handleTodoCommand(client, message) {
  if (!state.isStreaming) {
    client.say(channelName, 'Todo commands are only available while streaming 📺');
    return;
  }

  const args = message.trim().split(' ');
  const subcommand = args[0];
  const rest = args.slice(1).join(' ');

  switch (subcommand) {
    case 'add':
      addTodo(client, rest);
      break;
    case 'check':
      checkTodo(client, args[1]);
      break;
    case 'delete':
      deleteTodo(client, args[1]);
      break;
    case 'count':
      countTodos(client);
      break;
    case 'hide':
      hideTodos(client);
      break;
    case 'show':
      showTodos(client);
      break;
    default:
      client.say(channelName, 'Usage: !todo [add|check|delete|count|hide|show]');
  }
}

module.exports = handleTodoCommand;
