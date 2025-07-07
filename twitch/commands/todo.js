const { broadcastToClient } = require('@global/utilities/websocket');
const env = require('@global/utilities/env');
const state = require('@global/utilities/state');

const channelName = `#${env.twitch.channel.username}`;

function broadcastTodoState() {
  broadcastToClient({
    type: 'TODO',
    todos: state.todos,
    isVisible: state.isTodoVisible,
  });
}

function readTodo(client, indexStr) {
  state.isTodoVisible = true;
  const index = parseInt(indexStr, 10) - 1;
  if (isNaN(index) || index < 0 || index >= state.todos.length) {
    client.say(channelName, 'Invalid task number. Usage: !todo read <number>');
    return;
  }

  const todo = state.todos[index];
  const status = todo.done ? '✅' : '📝';
  client.say(channelName, `Todo #${index + 1}: ${todo.todo} ${status}`);
  broadcastTodoState();
}

function addTodo(client, task) {
  state.isTodoVisible = true;
  if (!task) {
    client.say(channelName, 'Please provide a task: !todo add <task>');
    return;
  }

  state.todos.push({ todo: task, done: false });
  broadcastTodoState();
  client.say(channelName, `Added task: "${task}" ✅`);
}

function checkTodo(client, indexStr) {
  state.isTodoVisible = true;
  const index = parseInt(indexStr, 10) - 1;
  if (isNaN(index) || index < 0 || index >= state.todos.length) {
    client.say(channelName, 'Invalid task number. Usage: !todo check <number>');
    return;
  }

  state.todos[index].done = true;
  broadcastTodoState();
  client.say(channelName, `Marked task ${index + 1} as done ✅`);
}

function deleteTodo(client, indexStr) {
  state.isTodoVisible = true;
  const index = parseInt(indexStr, 10) - 1;
  if (isNaN(index) || index < 0 || index >= state.todos.length) {
    client.say(channelName, 'Invalid task number. Usage: !todo delete <number>');
    return;
  }

  const [removed] = state.todos.splice(index, 1);
  broadcastTodoState();
  client.say(channelName, `Deleted task: "${removed.todo}" 🗑️`);
}

function countTodos(client) {
  const done = state.todos.filter(t => t.done).length;
  const total = state.todos.length;
  client.say(channelName, `Todo progress: ${done}/${total} ✅`);
}

function hideTodos(client) {
  state.isTodoVisible = false;
  broadcastTodoState();
  client.say(channelName, 'Todo list hidden 👀');
}

function showTodos(client) {
  state.isTodoVisible = true;
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
    case 'read':
      readTodo(client, args[1]);
      break;
    default:
      client.say(channelName, 'Usage: !todo [read|add|check|delete|count|hide|show]');
  }
}

module.exports = handleTodoCommand;
