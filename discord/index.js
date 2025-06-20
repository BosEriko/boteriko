const { Client, GatewayIntentBits } = require('discord.js');

// Commands
const pingCommand = require("@global/ping.js");

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

client.on('messageCreate', message => {
  // Ignore messages from bots
  if (message.author.bot) return;

  // Ensure the message is from the correct server
  if (message.guild?.id !== process.env.DISCORD_SERVER_ID) return;

  // Ignore messages from webhooks
  if (message.webhookId) return;

  // Ping Command
  if (message.content === '!ping') {
    message.reply(pingCommand());
  }
});

client.login(process.env.DISCORD_BOT_TOKEN);