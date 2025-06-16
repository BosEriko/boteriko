const tmi = require('tmi.js');
const firebase = require('../global/utilities/firebase');

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
    client.say(channel, 'Pong!');
  }
});
