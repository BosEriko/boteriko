const create_task = require("./create_task");
const delete_task = require("./delete_task");
const count_tasks = require("./count_tasks");
const hide_list = require("./hide_list");
const show_list = require("./show_list");
const read_task = require("./read_task");

const channelName = `#${Config.twitch.channel.username}`;

async function todo(client, message) {
  const args = message.trim().split(' ');
  const subcommand = args[0];
  const rest = args.slice(1).join(' ');

  try {
    switch (subcommand) {
      case 'add':
        await create_task(client, rest);
        break;
      case 'check':
        await delete_task(client, args[1]);
        break;
      case 'count':
        await count_tasks(client);
        break;
      case 'hide':
        hide_list(client);
        break;
      case 'show':
        show_list(client);
        break;
      case 'read':
        await read_task(client, args[1]);
        break;
      default:
        client.say(channelName, 'Usage: !todo [read|add|check|count|hide|show]');
    }
  } catch (err) {
    await Utility.error_logger("Something went wrong while handling the todo command:", err);
    client.say(channelName, 'An error occurred while handling the todo command ❌');
  }
}

module.exports = todo;
