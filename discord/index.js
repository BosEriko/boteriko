const { Client, GatewayIntentBits } = require('discord.js');

// Commands
const pingCommand = require("@global/commands/ping");
const topicCommand = require('@global/commands/topic');

// Utilities
const handleChatUtility = require('@discord/utilities/chat');

// Environment
const env = require('@global/utilities/env');

// -------------------------------------- Discord Bot Setup ----------------------------------------

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

// ----------------------------------------- Chat Commands -----------------------------------------

client.on('messageCreate', async message => {
  // Ignore messages from bots
  if (message.author.bot) return;

  // Ensure the message is from the correct server
  if (message.guild?.id !== env.discord.server.id) return;

  // Ignore messages from webhooks
  if (message.webhookId) return;

  // Chat Utility
  handleChatUtility(message.author.id);

  // Topic Command
  if (message.content === '!topic') {
    message.reply(await topicCommand(env.openrouter.apiKey));
  }

  // Ping Command
  if (message.content === '!ping') {
    message.reply(pingCommand());
  }
});

client.login(env.discord.bot.token);
