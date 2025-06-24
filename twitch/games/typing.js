const broadcastToClient = require('@global/utilities/websocket');
const firebaseUtility = require('@global/utilities/firebase');
const typingConstant = require('@twitch/constants/typing');
const statisticUtility = require('@global/utilities/statistic');
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

function handleTypingGameTop(client, channel) {
    const sorted = Object.entries(state.typingLeaderboard)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

    const response = sorted.length > 0
        ? sorted.map(([user, count], i) => `${i + 1}. ${user} (${count})`).join(' | ')
        : 'No one has scored yet!';

    client.say(channel, `🏆 Leaderboard: ${response}`);
}

async function handleTypingGame(client, channel, tags, message, user) {
  const msg = message.trim().toLowerCase();
  const matchIndex = activeWords.findIndex(entry => entry.word === msg);

  if (matchIndex !== -1) {
    const username = tags.username;
    client.say(channel, `✅ @${username} typed "${msg}" correctly!`);

    activeWords.splice(matchIndex, 1);

    state.typingLeaderboard[username] = (state.typingLeaderboard[username] || 0) + 1;

    if (!user) return;

    await statisticUtility(firebaseUtility.database(), user.id, { coins: 10 });
    broadcastToClient({ type: 'CORRECT_GUESS', word: msg });

    return;
  }
}

module.exports = { handleTypingGame, handleTypingGameTop };
