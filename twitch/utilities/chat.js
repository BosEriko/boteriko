const broadcastToClient = require('@global/utilities/websocket');
const firebaseUtility = require('@global/utilities/firebase');
const attendanceUtility = require('@global/utilities/attendance');
const statisticUtility = require('@global/utilities/statistic');
const syncUserUtility = require('@global/utilities/syncUser');
const sendToDiscordUtility = require('@twitch/utilities/sendToDiscord');

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
    sendToDiscordUtility(user, message, webhookUrl),
    saveToRealtimeDatabase(user)
  ]);
}

module.exports = handleChatUtility;
