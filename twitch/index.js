const client = require('@twitch/utilities/client');
const env = require('@global/utilities/env');
const state = require('@global/utilities/state');

// Utilities
const handleChatUtility = require('@twitch/utilities/chat');
const handleCronUtility = require('@twitch/utilities/cron');
const handleEventUtility = require('@twitch/utilities/event');
const handleFirstUtility = require('@twitch/utilities/first');
const handleLinkUtility = require('@twitch/utilities/link');
const handleShoutoutUtility = require('@twitch/utilities/shoutout');
const handleTypingGame = require('@twitch/games/typing');
const handleUserUtility = require('@global/utilities/user');

// Commands
const handleAskCommand = require('@global/commands/ask');
const handleBrbCommand = require('@twitch/commands/brb');
const handleCensorCommand = require("@twitch/commands/censor");
const handleDeezCommand = require('@global/commands/deez');
const handleFactCommand = require('@global/commands/fact');
const handleLurkCommand = require("@twitch/commands/lurk");
const handlePingCommand = require("@global/commands/ping");
const handlePomodoroCommand = require('@twitch/commands/pomodoro');
const handleRaidCommand = require('@twitch/commands/raid');
const handleScheduleCommand = require("@global/commands/schedule");
const handleSoundCommand = require('@twitch/commands/sound');
const handleTimeCommand = require('@global/commands/time');
const handleTodoCommand = require('@twitch/commands/todo');
const handleTopicCommand = require('@global/commands/topic');
const handleTypingTopCommand = require('@twitch/commands/typingTop');
const handleTypingWinnerCommand = require('@twitch/commands/typingWinner');

// Constants
const commandConstant = require('@global/constants/command');
const profanityConstant = require('@global/constants/profanity');

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

handleEventUtility(client);
handleCronUtility(client);

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
  handleLinkUtility(user, client, message);
  handleShoutoutUtility(isMod, isBroadcaster, user);
  handleTypingGame(client, channel, user, message);

  // Ensure the message is not empty and trim whitespace
  const msg = message.trim();
  const lowerMsg = msg.toLowerCase();

  // Sound Alert
  const soundTriggers = {
    BOO: ["boo", "jumpscare"],
    DING_DONG: ["dingdong"],
    GOTTEM: ["gottem"],
    HELLO: ["hi", "hello"],
    HUH: ["huh"],
    JOKE: ["jk", "joke", "kidding", "lol", "haha", "hehe", "hahaha", "hehehe"],
    NICE_TRY: ["nt"],
    PROFANITY: profanityConstant,
  };

  for (const [sound, keywords] of Object.entries(soundTriggers)) {
    if (keywords.some(word => lowerMsg.split(' ').includes(word))) {
      handleSoundCommand(sound);
      break;
    }
  }

  // Commands
  const isCommand = lowerMsg.startsWith('!') && lowerMsg.length > 1;
  if (!isCommand) return;

  const channelName = env.twitch.channel.username;
  const commandName = lowerMsg.split(' ')[0].replace('!', '');
  const commandArgs = msg.includes(' ') ? msg.slice(msg.indexOf(' ') + 1).trim() : '';
  const availableCommands = commandConstant.map(c => c.command);
  const restrictedCommands = commandConstant.filter(c => c.restricted).map(c => c.command);

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

  // Commands
  if (commandName === 'ask') client.say(channel, `🤖 @${tags.username} ${await handleAskCommand(commandArgs)}`);
  if (commandName === 'brb') handleBrbCommand(client, channel, commandArgs);
  if (commandName === 'censor') handleCensorCommand(client, channel);
  if (commandName === 'date') client.say(channel, handleTimeCommand('date'));
  if (commandName === 'dn') client.say(channel, `🤖 @${tags.username} ${await handleDeezCommand(msg.split(" ")[1])}`);
  if (commandName === 'fact') client.say(channel, await handleFactCommand());
  if (commandName === 'lurk') client.say(channel, handleLurkCommand(tags.username));
  if (commandName === 'ping') client.say(channel, handlePingCommand());
  if (commandName === 'pomodoro') handlePomodoroCommand(client, commandArgs);
  if (commandName === 'raid') await handleRaidCommand(client, commandArgs, isBroadcaster);
  if (commandName === 'schedule') client.say(channel, handleScheduleCommand());
  if (commandName === 'time') client.say(channel, handleTimeCommand('time'));
  if (commandName === 'todo') await handleTodoCommand(client, commandArgs);
  if (commandName === 'top') await handleTypingTopCommand(client, channel);
  if (commandName === 'topic') client.say(channel, await handleTopicCommand());
  if (commandName === 'winner') await handleTypingWinnerCommand(client, channel);
});