const tmi = require('tmi.js');
const cron = require('node-cron');

// Utilities
const isStreamingUtility = require("../global/utilities/isStreaming");
const handleInformationUtility = require('./utilities/information');

// Commands
const pingCommand = require("@global/ping.js");

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

// ----------------------------------------- Chat Commands -----------------------------------------

client.on('message', async (channel, tags, message, self) => {
  // Ignore messages from the bot itself
  if (self) return;

  // Ensure the message is not empty and trim whitespace
  const msg = message.trim();
  const lowerMsg = msg.toLowerCase();

  // Ping Command
  if (lowerMsg === '!ping') {
    client.say(channel, pingCommand());
  }
});

// ------------------------------------------- Functions -------------------------------------------

// Information Rotator
async function checkStreamAndRunInformationUtility() {
  try {
    const isStreaming = await isStreamingUtility(
      process.env.TWITCH_CHANNEL_USERNAME,
      process.env.TWITCH_BOT_CLIENT_ID,
      process.env.TWITCH_BOT_ACCESS_TOKEN
    );
    if (isStreaming) {
      handleInformationUtility(client, process.env.TWITCH_CHANNEL_USERNAME);
    }
  } catch (error) {
    console.error("Stream check failed:", error.message);
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
  console.log('Running every 1 minute');
});

// Every 5 minutes
cron.schedule('*/5 * * * *', () => {
  console.log('Running every 5 minutes');
});

// Every 10 minutes
cron.schedule('*/10 * * * *', () => {
  checkStreamAndRunInformationUtility();
});