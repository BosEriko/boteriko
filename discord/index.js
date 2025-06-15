const { Client, GatewayIntentBits } = require('discord.js');

// --- Firebase Admin SDK ---
const firebase = require('firebase-admin');

if (!firebase.apps.length) {
  firebase.initializeApp({
    credential: firebase.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  })
}

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