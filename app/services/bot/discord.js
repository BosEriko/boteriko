const client = require('@discord/utilities/client');

// Commands
const handleListCommand = require('@discord/commands/list');
const handlePingCommand = require("@global/commands/ping");
const handleScheduleCommand = require("@global/commands/schedule");
const handleTimeCommand = require('@global/commands/time');
const handleTodoCommand = require('@discord/commands/todo');

// Utilities
const handleChatUtility = require('@discord/utilities/chat');

// -------------------------------------- Discord Bot Setup ----------------------------------------

client.on('ready', () => {
  console.log(`✅ Connected to Discord server.`);
});

// ---------------------------------------- Private Command ----------------------------------------

async function handlePrivateCommand(message, handler, commandArgs, commandLabel = '') {
  try {
    await message.delete();
    const response = await handler(commandArgs);
    await message.author.send(`🤖 ${commandLabel ? `${commandLabel}: ` : ''}${response}`);
  } catch (err) {
    await Utility.error_logger(`${commandLabel || 'Private'} command error:`, err);
  }
}

// ----------------------------------------- Chat Commands -----------------------------------------

client.on('messageCreate', async message => {
  if (message.author.bot || message.webhookId) return;
  if (message.guild?.id !== Config.discord.server.id) return;

  // Chat Utility
  handleChatUtility(message.author.id);

  const msg = message.content.trim();
  const lowerMsg = msg.toLowerCase();

  // Command Handling
  const isCommand = lowerMsg.startsWith('!') && lowerMsg.length > 1;
  if (!isCommand) return;

  const commandName = lowerMsg.split(' ')[0].replace('!', '');
  const commandArgs = msg.includes(' ') ? msg.slice(msg.indexOf(' ') + 1).trim() : '';
  const availableCommands = Constant.Command.map(c => c.command);
  const restrictedCommands = Constant.Command.filter(c => c.restricted).map(c => c.command);

  // Check if the command is available
  if (!availableCommands.includes(commandName)) {
    message.reply(`❌ \`${commandName}\` is not a command.`);
    return;
  }

  // Check if the command is restricted
  if (restrictedCommands.includes(commandName) && message.author.id !== Config.discord.owner.id) {
    message.reply(`❌ Only the bot owner can use the \`${commandName}\` command.`);
    return;
  }

  // Commands
  if (commandName === 'commands') return await handleListCommand(message);
  if (commandName === 'date') return message.reply(handleTimeCommand('date'));
  if (commandName === 'discord') return message.reply(Controller.Link.general("discord"));
  if (commandName === 'ping') return message.reply(handlePingCommand());
  if (commandName === 'profile') return message.reply(await Controller.Link.profile[D](message.author, commandArgs));
  if (commandName === 'schedule') return message.reply(handleScheduleCommand());
  if (commandName === 'steam') return message.reply(Controller.Link.general("steam"));
  if (commandName === 'time') return message.reply(handleTimeCommand('time'));
  if (commandName === 'todo') return await handlePrivateCommand(message, handleTodoCommand, commandArgs, 'Todo');
});

client.login(Config.discord.bot.token);
