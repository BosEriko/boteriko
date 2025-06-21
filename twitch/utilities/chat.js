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

async function saveToFirestore(user, db) {
  const firestore = db.firestore();
  const auth = db.auth();
  const docRef = firestore.collection('users').doc(user.id);

  await docRef.set({
    displayName: user.display_name,
    profileImage: user.profile_image_url,
    twitchMessageCount: db.firestore.FieldValue.increment(1),
    points: db.firestore.FieldValue.increment(1)
  }, { merge: true });

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

  const messagesCountsRef = firestore.collection('messages_counts').doc(user.id);
  const today = new Date().toISOString().slice(0, 10);
  const doc = await messagesCountsRef.get();

  let content = [];
  if (doc.exists) {
    content = doc.data().content || [];
  }

  const todayIndex = content.findIndex(entry => entry.timestamp === today);
  if (todayIndex > -1) {
    content[todayIndex].twitchMessageCount = (content[todayIndex].twitchMessageCount || 0) + 1;
  } else {
    content.push({ timestamp: today, twitchMessageCount: 1 });
  }

  await messagesCountsRef.set({ content }, { merge: true });
}

async function handleChatUtility(user, message, webhookUrl) {
  broadcastToClient({ type: 'NEW_CHAT', username: user.display_name, message });

  if (!user) return;

  await Promise.all([
    sendToDiscord(user, message, webhookUrl),
    saveToFirestore(user, firebaseUtility)
  ]);
}

module.exports = handleChatUtility;