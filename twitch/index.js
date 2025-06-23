const client = require('@twitch/utilities/client');
const cron = require('node-cron');
const env = require('@global/utilities/env');

// Utilities
const handleIsStreamingUtility = require("@global/utilities/isStreaming");
const handleInformationUtility = require('@twitch/utilities/information');
const handleFollowUtility = require('@twitch/utilities/follow');
const handleUserUtility = require('@twitch/utilities/user');
const handleChatUtility = require('@twitch/utilities/chat');
const handleShoutoutUtility = require('@twitch/utilities/shoutout');
const handleEventUtility = require('@twitch/utilities/event');
const handleSetupUtility = require('@twitch/utilities/setup');

// Commands
const pingCommand = require("@global/commands/ping");
const topicCommand = require('@global/commands/topic');

// --------------------------------------- Twitch Bot Setup ----------------------------------------
client.connect();

client.on('connected', (address, port) => {
  console.log(`✅ Connected to Twitch chat.`);
});

// --------------------------------------- Global Variables ----------------------------------------

let isStreaming = false;
let lastMessageTimestamp = Date.now();

// ---------------------------------------- Event Handlers -----------------------------------------

handleEventUtility(client);

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

  // Additional checks for command execution
  const channelName = env.twitch.channel.username;
  const commandName = lowerMsg.split(' ')[0].replace('!', '');
  const isCommand = lowerMsg.startsWith('!') && lowerMsg.length > 1;
  const availableCommands = ['topic', 'ping', 'pomodoro', 'brb'];
  const restrictedCommands = ['pomodoro', 'brb'];
  if (isCommand) {
    if (!availableCommands.includes(commandName)) {
      client.say(channel, `${commandName} is not a command. ❌`);
      return;
    };
    if (restrictedCommands.includes(commandName) && tags['display-name'] !== channelName) {
      client.say(channel, `Only ${channelName} can control the ${commandName} command. ❌`);
      return;
    }
  }

  // Topic Command
  if (lowerMsg === '!topic') client.say(channel, await topicCommand());

  // Ping Command
  if (lowerMsg === '!ping') client.say(channel, pingCommand());
});

// ------------------------------------------- Functions -------------------------------------------

// isStreaming Utility
async function checkStreamAvailability() {
  try {
    isStreaming = await handleIsStreamingUtility();
  } catch (error) {
    console.error("Error checking stream availability:", error.message);
  }
}

// Conversation Utility
async function runConversationUtility() {
  const now = Date.now();
  const fiveMinutes = 5 * 60 * 1000;

  if (now - lastMessageTimestamp >= fiveMinutes) {
    client.say(`#${env.twitch.channel.username}`, `💭 ${await topicCommand()}`);
    lastMessageTimestamp = now;
  }
}

// follow Utility
function checkNewFollowers() {
  const username = env.twitch.channel.username;
  handleFollowUtility(newFollower => client.say(`#${username}`, `${newFollower} just followed!`));
}

// ------------------------------------------- Cron Jobs -------------------------------------------

// Every 1 minute
cron.schedule('* * * * *', () => {
  handleSetupUtility(client);
  if (isStreaming) checkNewFollowers();
  if (isStreaming) runConversationUtility();
});

// Every 5 minutes
cron.schedule('*/5 * * * *', () => {
  checkStreamAvailability();
});

// Every 10 minutes
cron.schedule('*/10 * * * *', () => {
  if (isStreaming) handleInformationUtility(client);
});