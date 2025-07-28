const cron = require('node-cron');
const { broadcastToClient } = require('@global/utilities/websocket');
const firebaseUtility = require('@global/utilities/firebase');
const typingConstant = require('@twitch/constants/typing');
const walletUtility = require('@global/utilities/wallet');
const typingUtility = require('@global/utilities/typing');
const state = require('@global/utilities/state');
const env = require('@config/environments/base');

// Configurable variables
const WORD_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes
const REWARD_POINTS = 2;

let activeWords = [];

function sendRandomWord() {
  const word = typingConstant[Math.floor(Math.random() * typingConstant.length)];
  activeWords.push({ word, timestamp: Date.now() });
  broadcastToClient({ type: 'NEW_WORD', word });
}

function cleanupExpiredWords() {
  const now = Date.now();
  activeWords = activeWords.filter(entry => now - entry.timestamp < WORD_EXPIRY_MS);
}

function handleTypingCron() {
  cron.schedule('* * * * *', () => {
    if (!state.isStreaming) return;

    sendRandomWord();
    cleanupExpiredWords();
  }, { timezone: env.app.timeZone });
}
handleTypingCron();

async function handleTypingGame(client, channel, user, message) {
  if (!user || !message) return;

  const msg = message.trim().toLowerCase();
  const matchIndex = activeWords.findIndex(entry => entry.word === msg);

  if (matchIndex === -1) return;

  const username = user.display_name;
  const twitchId = user.id;

  client.say(channel, `✅ @${username} typed "${msg}" correctly!`);
  activeWords.splice(matchIndex, 1);

  const rtdb = firebaseUtility.database();
  await walletUtility(rtdb, twitchId, { coins: REWARD_POINTS });
  await typingUtility(rtdb, username, 1);

  broadcastToClient({ type: 'CORRECT_GUESS', word: msg, username });
}

module.exports = handleTypingGame;
