const { broadcastToClient } = require('@global/utilities/websocket');
const firebaseUtility = require('@global/utilities/firebase');
const typingConstant = require('@twitch/constants/typing');
const walletUtility = require('@global/utilities/wallet');
const state = require('@global/utilities/state');

let activeWords = [];

function sendRandomWord() {
  const word = typingConstant[Math.floor(Math.random() * typingConstant.length)];
  activeWords.push({ word, timestamp: Date.now() });
  broadcastToClient({ type: 'NEW_WORD', word });
}

function cleanupExpiredWords() {
  const TEN_MINUTES = 10 * 60 * 1000;
  const now = Date.now();
  activeWords = activeWords.filter(entry => now - entry.timestamp < TEN_MINUTES);
}

// Start timers
setInterval(sendRandomWord, 5 * 60 * 1000);
setInterval(cleanupExpiredWords, 5 * 60 * 1000);

async function handleTypingGame(client, channel, user, message) {
  const msg = message.trim().toLowerCase();
  const matchIndex = activeWords.findIndex(entry => entry.word === msg);

  if (matchIndex !== -1) {
    const username = user.login;

    client.say(channel, `✅ @${username} typed "${msg}" correctly!`);
    activeWords.splice(matchIndex, 1);
    state.typingLeaderboard[username] = (state.typingLeaderboard[username] || 0) + 1;

    if (!user) return;

    await walletUtility(firebaseUtility.database(), user.id, { coins: 10 });
    broadcastToClient({ type: 'CORRECT_GUESS', word: msg });
    return;
  }
}

module.exports = handleTypingGame;
