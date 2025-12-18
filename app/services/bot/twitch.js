const client = require('@twitch/utilities/client');
const state = require('@global/utilities/state');

// Utilities
const { handleTypingGame } = require('@twitch/games/typing');
const handleChatUtility = require('@twitch/utilities/chat');
const handleCronUtility = require('@twitch/utilities/cron');
const handleEventUtility = require('@twitch/utilities/event');
const handleFirstUtility = require('@twitch/utilities/first');
const handleLinkUtility = require('@twitch/utilities/link');
const handlePointUtility = require('@twitch/utilities/point');
const handleShoutoutUtility = require('@twitch/utilities/shoutout');
const handleUserUtility = require('@global/utilities/user');

// Commands
const handleBackCommand = require('@twitch/commands/back');
const handleBrbCommand = require('@twitch/commands/brb');
const handleCensorCommand = require("@twitch/commands/censor");
const handleLurkCommand = require("@twitch/commands/lurk");
const handlePingCommand = require("@global/commands/ping");
const handlePomodoroCommand = require('@twitch/commands/pomodoro');
const handleRaidCommand = require('@twitch/commands/raid');
const handleScheduleCommand = require("@global/commands/schedule");
const handleSoundCommand = require('@twitch/commands/sound');
const handleTimeCommand = require('@global/commands/time');
const handleTodoCommand = require('@twitch/commands/todo');
const handleTypingTopCommand = require('@twitch/commands/typingTop');
const handleTypingWinnerCommand = require('@twitch/commands/typingWinner');

// --------------------------------------- Twitch Bot Setup ----------------------------------------
client.connect();

const connectionMessage = "✅ Connected to Twitch chat.";

client.on('connected', (address, port) => {
  console.log(connectionMessage);
});

client.on('join', (channel, username, self) => {
  if (self) client.say(channel, connectionMessage);
});

// ----------------------------------------- Block Import ------------------------------------------

Controller.Twitch.create_custom_rewards();
Controller.Twitch.update_schedule();
Controller.Music.polling();
handleCronUtility(client);
handleEventUtility(client);
handlePointUtility(client);

// ----------------------------------------- Chat Commands -----------------------------------------

client.on('message', async (channel, tags, message, self) => {
  // Ignore messages from the bot itself
  if (self) return;

  // Update the timestamp
  state.lastMessageTimestamp = Date.now();

  // Fetch Twitch user information
  const user = await handleUserUtility(tags['display-name']);

  // Badges
  const isMod = tags.mod === true || tags.badges?.moderator === '1';
  const isBroadcaster = tags.badges?.broadcaster === '1';

  // Utilities
  handleChatUtility(user, message, tags.emotes);
  handleFirstUtility(isMod, isBroadcaster, user, client);
  if (!tags["custom-reward-id"]) handleLinkUtility(user, client, message);
  handleShoutoutUtility(isMod, isBroadcaster, user);
  handleTypingGame(client, channel, user, message);

  // Ensure the message is not empty and trim whitespace
  const msg = message.trim();
  const lowerMsg = msg.toLowerCase();

  // Sound Alert
  for (const [sound, keywords] of Object.entries(Constant.SoundTrigger)) {
    if (keywords.some(word => lowerMsg.split(' ').includes(word))) {
      handleSoundCommand(sound);
      break;
    }
  }

  // Commands
  const isCommand = lowerMsg.startsWith('!') && lowerMsg.length > 1;
  if (!isCommand) return;

  const channelName = Config.twitch.channel.username;
  const commandName = lowerMsg.split(' ')[0].replace('!', '');
  const commandArgs = msg.includes(' ') ? msg.slice(msg.indexOf(' ') + 1).trim() : '';

  const availableCommands = Constant.Command.map(c => c.command);
  const restrictedCommands = Constant.Command.filter(c => c.restricted).map(c => c.command);
  const streamingCommands = Constant.Command.filter(c => c.streaming).map(c => c.command);

  // Check if the command is available
  if (!availableCommands.includes(commandName)) {
    client.say(channel, `${commandName} is not a command. ❌`);
    return;
  };

  // Check if the command is restricted
  if (restrictedCommands.includes(commandName) && tags['display-name'] !== channelName) {
    client.say(channel, `Only ${channelName} can control the ${commandName} command. ❌`);
    return;
  }

  // Check if the command requires streaming
  if (streamingCommands.includes(commandName) && !state.isStreaming) {
    client.say(channel, `The ${commandName} command only works when streaming. ⚠️`);
    return;
  }

  // Commands
  if (commandName === 'autoraid') client.say(channel, await Controller.Twitch.auto_raid(commandArgs));
  if (commandName === 'back') handleBackCommand(client, channel);
  if (commandName === 'brb') handleBrbCommand(client, channel, commandArgs);
  if (commandName === 'censor') handleCensorCommand(client, channel);
  if (commandName === 'date') client.say(channel, handleTimeCommand('date'));
  if (commandName === 'discord') client.say(channel, Controller.Link.discord());
  if (commandName === 'lurk') client.say(channel, handleLurkCommand(tags.username));
  if (commandName === 'ping') client.say(channel, handlePingCommand());
  if (commandName === 'pomodoro') handlePomodoroCommand(client, commandArgs);
  if (commandName === 'profile') client.say(channel, await Controller.Link.profile[T](tags, commandArgs));
  if (commandName === 'queue') client.say(channel, await Controller.Link.queue());
  if (commandName === 'raid') await handleRaidCommand(client, commandArgs, isBroadcaster);
  if (commandName === 'schedule') client.say(channel, handleScheduleCommand());
  if (commandName === 'setgame') client.say(channel, await Controller.Twitch.update_game(commandArgs));
  if (commandName === 'settitle') client.say(channel, await Controller.Twitch.update_title(commandArgs));
  if (commandName === 'song') client.say(channel, await Controller.Music.get_current_song());
  if (commandName === 'steam') client.say(channel, Controller.Link.steam());
  if (commandName === 'time') client.say(channel, handleTimeCommand('time'));
  if (commandName === 'todo') await handleTodoCommand(client, commandArgs);
  if (commandName === 'top') await handleTypingTopCommand(client, channel);
  if (commandName === 'winner') await handleTypingWinnerCommand(client, channel);
});