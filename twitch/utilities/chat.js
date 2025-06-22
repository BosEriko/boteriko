const axios = require('axios');
const broadcastToClient = require('@global/utilities/websocket');
const firebaseUtility = require('@global/utilities/firebase');
const attendanceUtility = require('@global/utilities/attendance');
const statisticUtility = require('@global/utilities/statistic');
const syncUserUtility = require('@global/utilities/syncUser');

let recentTimestamps = [];

function canSendDiscordMessage() {
  const now = Date.now();
  recentTimestamps = recentTimestamps.filter(ts => now - ts < 1000);
  if (recentTimestamps.length < 2) {
    recentTimestamps.push(now);
    return true;
  }
  return false;
}

async function sendToDiscord(user, message, webhookUrl) {
  if (!canSendDiscordMessage()) {
    console.warn('Too many Discord messages — dropping one.');
    return;
  }

  try {
    await axios.post(webhookUrl, {
      username: user.display_name || user.login,
      content: message,
      avatar_url: user.profile_image_url,
    });
  } catch (error) {
    console.error('Failed to send message to Discord:', error.message);
  }
}

async function saveToRealtimeDatabase(user) {
  const rtdb = firebaseUtility.database();
  const auth = firebaseUtility.auth();

  await syncUserUtility(auth, user);

  await statisticUtility(rtdb, user.id, { twitchMessageCount: 1, coins: 1 });

  await attendanceUtility(rtdb, user.id, 'twitchMessageCount');
}

async function handleChatUtility(user, message, webhookUrl) {
  broadcastToClient({ type: 'NEW_CHAT', username: user.display_name, message });

  if (!user) return;

  await Promise.all([
    sendToDiscord(user, message, webhookUrl),
    saveToRealtimeDatabase(user)
  ]);
}

module.exports = handleChatUtility;
