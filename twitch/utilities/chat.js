const axios = require('axios');
const broadcastToClient = require('@global/utilities/websocket');
const firebaseUtility = require('@global/utilities/firebase');

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
  const userRef = rtdb.ref(`users/${user.id}`);

  const snapshot = await userRef.once('value');
  const existingData = snapshot.val() || {};

  const updatedData = {
    twitchMessageCount: (existingData.twitchMessageCount || 0) + 1,
    coins: (existingData.coins || 0) + 1
  };

  await userRef.update(updatedData);

  try {
    await auth.updateUser(user.id, {
      displayName: user.display_name
    });
  } catch (error) {
    if (error.code === 'auth/user-not-found') {
      await auth.createUser({
        uid: user.id,
        displayName: user.display_name
      });
    } else {
      console.error(`Failed to update/create auth user: ${error.message}`);
    }
  }

  const today = new Date().toISOString().slice(0, 10);
  const messageCountRef = rtdb.ref(`messages_counts/${user.id}/content/${today}`);
  const messageSnapshot = await messageCountRef.once('value');
  const existingCount = messageSnapshot.val()?.twitchMessageCount || 0;

  await messageCountRef.update({
    twitchMessageCount: existingCount + 1
  });
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
