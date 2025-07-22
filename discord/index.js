const client = require('@discord/utilities/client');

// Commands
const handleAskCommand = require('@global/commands/ask');
const handleDeezCommand = require('@global/commands/deez');
const handleFactCommand = require('@global/commands/fact');
const handlePingCommand = require("@global/commands/ping");
const handleScheduleCommand = require("@global/commands/schedule");
const handleTimeCommand = require('@global/commands/time');
const handleTodoCommand = require('@discord/commands/todo');
const handleTopicCommand = require('@global/commands/topic');

// Utilities
const handleChatUtility = require('@discord/utilities/chat');
const handleCommandUtility = require('@discord/utilities/command');
const handleErrorUtility = require('@global/utilities/error');

// Constants
const commandConstant = require('@global/constants/command');

// Environment
const env = require('@global/utilities/env');

// -------------------------------------- Discord Bot Setup ----------------------------------------

client.on('ready', () => {
  console.log(`✅ Connected to Discord server.`);
  handleCommandUtility(client);
});

// ---------------------------------------- Private Command ----------------------------------------

async function handlePrivateCommand(message, handler, commandArgs, commandLabel = '') {
  try {
    await message.delete();
    const response = await handler(commandArgs);
    await message.author.send(`🤖 ${commandLabel ? `${commandLabel}: ` : ''}${response}`);
  } catch (err) {
    await handleErrorUtility(`${commandLabel || 'Private'} command error:`, err);
  }
}

// ----------------------------------------- Chat Commands -----------------------------------------

client.on('messageCreate', async message => {
  if (message.author.bot || message.webhookId) return;
  if (message.guild?.id !== env.discord.server.id) return;

  // Chat Utility
  handleChatUtility(message.author.id);

  const msg = message.content.trim();
  const lowerMsg = msg.toLowerCase();

  // Command Handling
  const isCommand = lowerMsg.startsWith('!') && lowerMsg.length > 1;
  if (!isCommand) return;

  const commandName = lowerMsg.split(' ')[0].replace('!', '');
  const commandArgs = msg.includes(' ') ? msg.slice(msg.indexOf(' ') + 1).trim() : '';
  const availableCommands = commandConstant.map(c => c.command);
  const restrictedCommands = commandConstant.filter(c => c.restricted).map(c => c.command);

  // Check if the command is available
  if (!availableCommands.includes(commandName)) {
    message.reply(`❌ \`${commandName}\` is not a command.`);
    return;
  }

  // Check if the command is restricted
  if (restrictedCommands.includes(commandName) && message.author.id !== env.discord.owner.id) {
    message.reply(`❌ Only the bot owner can use the \`${commandName}\` command.`);
    return;
  }

  // Commands
  if (commandName === 'ask') return message.reply(`🤖 ${await handleAskCommand(commandArgs)}`);
  if (commandName === 'date') return message.reply(handleTimeCommand('date'));
  if (commandName === 'dn') return message.reply(`🤖 ${await handleDeezCommand(msg.split(" ")[1])}`);
  if (commandName === 'fact') return message.reply(await handleFactCommand());
  if (commandName === 'ping') return message.reply(handlePingCommand());
  if (commandName === 'schedule') return message.reply(handleScheduleCommand());
  if (commandName === 'time') return message.reply(handleTimeCommand('time'));
  if (commandName === 'todo') return await handlePrivateCommand(message, handleTodoCommand, commandArgs, 'Todo');
  if (commandName === 'topic') return message.reply(await handleTopicCommand());
});

client.login(env.discord.bot.token);
