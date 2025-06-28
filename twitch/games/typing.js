const { broadcastToClient } = require('@global/utilities/websocket');
const firebaseUtility = require('@global/utilities/firebase');
const typingConstant = require('@twitch/constants/typing');
const walletUtility = require('@global/utilities/wallet');
const state = require('@global/utilities/state');

// Configurable variables
const WORD_INTERVAL_MS = 1 * 60 * 1000; // 1 minutes
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

// Start timers
setInterval(() => {
  sendRandomWord();
  cleanupExpiredWords();
}, WORD_INTERVAL_MS);

async function handleTypingGame(client, channel, user, message) {
  const msg = message.trim().toLowerCase();
  const matchIndex = activeWords.findIndex(entry => entry.word === msg);

  if (matchIndex !== -1) {
    const username = user.login;

    client.say(channel, `✅ @${username} typed "${msg}" correctly!`);
    activeWords.splice(matchIndex, 1);
    state.typingLeaderboard[username] = (state.typingLeaderboard[username] || 0) + 1;

    if (!user) return;

    await walletUtility(firebaseUtility.database(), user.id, { coins: REWARD_POINTS });
    broadcastToClient({ type: 'CORRECT_GUESS', word: msg });
    return;
  }
}

module.exports = handleTypingGame;
