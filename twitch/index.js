const client = require('@twitch/utilities/client');
const env = require('@global/utilities/env');

// Utilities
const handleUserUtility = require('@twitch/utilities/user');
const handleChatUtility = require('@twitch/utilities/chat');
const handleShoutoutUtility = require('@twitch/utilities/shoutout');
const handleEventUtility = require('@twitch/utilities/event');
const handleCronUtility = require('@twitch/utilities/cron');

// Commands
const handlePingCommand = require("@global/commands/ping");
const handleTopicCommand = require('@global/commands/topic');
const handleBrbCommand = require('@twitch/commands/brb');
const handleSoundCommand = require('@twitch/commands/sound');
const handleAskCommand = require('@global/commands/ask');

// Constants
const commandConstant = require('@global/constants/command');
const profanityConstant = require('@global/constants/profanity');

// --------------------------------------- Twitch Bot Setup ----------------------------------------
client.connect();

client.on('connected', (address, port) => {
  console.log(`✅ Connected to Twitch chat.`);
});

// ----------------------------------------- Block Import ------------------------------------------

handleEventUtility(client);
handleCronUtility(client);

// ----------------------------------------- Chat Commands -----------------------------------------

client.on('message', async (channel, tags, message, self) => {
  // Ignore messages from the bot itself
  if (self) return;

  // Fetch Twitch user information
  const user = await handleUserUtility(tags['display-name']);

  // Chat Utility
  handleChatUtility(user, message);

  // Shoutout Utility
  const isMod = tags.mod === true || tags.badges?.moderator === '1';
  const isBroadcaster = tags.badges?.broadcaster === '1';
  handleShoutoutUtility(isMod, isBroadcaster, user);

  // Ensure the message is not empty and trim whitespace
  const msg = message.trim();
  const lowerMsg = msg.toLowerCase();

  // Sound Alert
  const soundTriggers = {
    PROFANITY: profanityConstant,
    GOTTEM: ["gottem", "got 'em"],
    NICE_TRY: ["nice try", "nt"]
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

  // Ask Command
  if (commandName === 'ask') client.say(channel, `🤖 @${tags.username} ${await handleAskCommand(commandArgs)}`);

  // BRB Command
  if (commandName === 'brb') handleBrbCommand(client, channel, commandArgs);

  // Topic Command
  if (commandName === 'topic') client.say(channel, await handleTopicCommand());

  // Ping Command
  if (commandName === 'ping') client.say(channel, handlePingCommand());
});