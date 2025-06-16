const tmi = require('tmi.js');
const pingCommand = require("../global/commands/ping.js");

// --- Twitch Bot Setup ---
const client = new tmi.Client({
  identity: {
    username: process.env.BOT_USERNAME,
    password: process.env.BOT_ACCESS_TOKEN
  },
  channels: [ process.env.CHANNEL_USERNAME ]
});

client.connect();

client.on('connected', (address, port) => {
  console.log(`✅ Connected to Twitch chat.`);
});

// --- Chat Commands ---
client.on('message', async (channel, tags, message, self) => {
  if (self) return;

  const msg = message.trim();
  const lowerMsg = msg.toLowerCase();

  if (lowerMsg === '!ping') {
    client.say(channel, pingCommand());
  }
});

// --- Event Handlers ---
client.on('raided', (channel, username, viewers) => {
  client.say(channel, `${username} is raiding with ${viewers} viewers!`);
});

client.on('cheer', (channel, userstate, message) => {
  const username = userstate['display-name'];
  const bits = userstate['bits'];
  client.say(channel, `${username} cheered ${bits} bits: ${message}`);
});

client.on('subscription', (channel, username, method, message, userstate) => {
  client.say(channel, `${username} just subscribed!`);
});

client.on('resub', (channel, username, months, message, userstate, methods) => {
  client.say(channel, `${username} resubscribed for ${months} months!`);
});

client.on('subgift', (channel, username, streakMonths, recipient, methods, userstate) => {
  client.say(channel, `${username} gifted a sub to ${recipient}`);
});

client.on('hosted', (channel, username, viewers, autohost) => {
  client.say(channel, `${username} is hosting you with ${viewers} viewers`);
});