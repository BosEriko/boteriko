const tmi = require('tmi.js');
const cron = require('node-cron');

// Utilities
const isStreamingUtility = require("@global/utilities/isStreaming");
const handleInformationUtility = require('@twitch/utilities/information');
const handleFollowUtility = require('@twitch/utilities/follow');

// Commands
const pingCommand = require("@global/commands/ping");
const topicCommand = require('@global/commands/topic');

// --------------------------------------- Twitch Bot Setup ----------------------------------------

const client = new tmi.Client({
  identity: {
    username: process.env.TWITCH_BOT_USERNAME,
    password: process.env.TWITCH_BOT_ACCESS_TOKEN
  },
  channels: [ process.env.TWITCH_CHANNEL_USERNAME ]
});

client.connect();

client.on('connected', (address, port) => {
  console.log(`✅ Connected to Twitch chat.`);
});

// --------------------------------------- Global Variables ----------------------------------------

let isStreaming = false;
let lastMessageTimestamp = Date.now();

// ----------------------------------------- Chat Commands -----------------------------------------

client.on('message', async (channel, tags, message, self) => {
  // Ignore messages from the bot itself
  if (self) return;

  // Ensure the message is not empty and trim whitespace
  const msg = message.trim();
  const lowerMsg = msg.toLowerCase();


  // Topic Command
  if (lowerMsg === '!topic') client.say(channel, await topicCommand(process.env.OPENROUTER_API_KEY));

  // Ping Command
  if (lowerMsg === '!ping') client.say(channel, pingCommand());
});

// ------------------------------------------- Functions -------------------------------------------

// isStreaming Utility
async function checkStreamAvailability() {
  try {
    isStreaming = await isStreamingUtility(
      process.env.TWITCH_CHANNEL_USERNAME,
      process.env.TWITCH_BOT_CLIENT_ID,
      process.env.TWITCH_BOT_ACCESS_TOKEN
    );
  } catch (error) {
    console.error("Error checking stream availability:", error.message);
  }
}

// follow Utility
function checkNewFollowers() {
  handleFollowUtility(
    process.env.TWITCH_CHANNEL_ID,
    process.env.TWITCH_BOT_CLIENT_ID,
    process.env.TWITCH_BOT_ACCESS_TOKEN,
    (newFollower) => {
      client.say(`#${process.env.TWITCH_CHANNEL_USERNAME}`, `${newFollower} just followed!`);
    }
  );
}

// Conversation Utility
async function runConversationUtility() {
  const now = Date.now();
  const fiveMinutes = 5 * 60 * 1000;

  if (now - lastMessageTimestamp >= fiveMinutes) {
    client.say(`#${process.env.TWITCH_CHANNEL_USERNAME}`, `💭 ${await topicCommand(process.env.OPENROUTER_API_KEY)}`);
    lastMessageTimestamp = now;
  }
}

// ---------------------------------------- Event Handlers -----------------------------------------

// Raids
client.on('raided', (channel, username, viewers) => {
  client.say(channel, `${username} is raiding with ${viewers} viewers!`);
});

// Cheers
client.on('cheer', (channel, userstate, message) => {
  const username = userstate['display-name'];
  const bits = userstate['bits'];
  client.say(channel, `${username} cheered ${bits} bits: ${message}`);
});

// Subscriptions
client.on('subscription', (channel, username, method, message, userstate) => {
  client.say(channel, `${username} just subscribed!`);
});

// Resubscriptions
client.on('resub', (channel, username, months, message, userstate, methods) => {
  client.say(channel, `${username} resubscribed for ${months} months!`);
});

// Gifted Subscriptions
client.on('subgift', (channel, username, streakMonths, recipient, methods, userstate) => {
  client.say(channel, `${username} gifted a sub to ${recipient}`);
});

// Host
client.on('hosted', (channel, username, viewers, autohost) => {
  client.say(channel, `${username} is hosting you with ${viewers} viewers`);
});

// ------------------------------------------- Cron Jobs -------------------------------------------

// Every 1 minute
cron.schedule('* * * * *', () => {
  if (isStreaming) checkNewFollowers();
  if (isStreaming) runConversationUtility();
});

// Every 5 minutes
cron.schedule('*/5 * * * *', () => {
  checkStreamAvailability();
});

// Every 10 minutes
cron.schedule('*/10 * * * *', () => {
  if (isStreaming) handleInformationUtility(client, process.env.TWITCH_CHANNEL_USERNAME);
});