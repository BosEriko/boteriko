const { Client, GatewayIntentBits } = require('discord.js');
const firebase = require('../global/utilities/firebase');

// --- Discord Bot Setup ---
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ],
});

client.on('ready', () => {
  console.log(`✅ Connected to Discord server.`);
});

// --- Chat Commands ---
client.on('messageCreate', message => {
  // Ignore messages from bots
  if (message.author.bot) return;

  // Ensure the message is from the correct server
  if (message.guild?.id !== process.env.DISCORD_SERVER_ID) return;

  // Ignore messages from webhooks
  if (message.webhookId) return;

  if (message.content === '!ping') {
    message.reply('Pong!');
  }
});

client.login(process.env.DISCORD_TOKEN);