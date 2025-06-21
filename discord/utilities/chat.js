const firebaseUtility = require('@global/utilities/firebase');

async function saveToRealtimeDatabase(userId) {
  const rtdb = firebaseUtility.database();
  const usersRef = rtdb.ref(`users`);
  const snapshot = await usersRef.orderByChild('discordId').equalTo(userId).once('value');

  if (!snapshot.exists()) {
    console.log("User not found, skipping.");
    return;
  }

  const userKey = Object.keys(snapshot.val())[0];
  const userRef = usersRef.child(userKey);

  const userSnap = await userRef.once('value');
  const userData = userSnap.val() || {};

  await userRef.update({
    discordMessageCount: (userData.discordMessageCount || 0) + 1,
    points: (userData.points || 0) + 1
  });

  const today = new Date().toISOString().slice(0, 10);
  const messagesCountRef = rtdb.ref(`messages_counts/${userKey}/content`);
  const messagesSnap = await messagesCountRef.once('value');
  const content = messagesSnap.val() || [];

  const updatedContent = Array.isArray(content) ? [...content] : [];
  const todayIndex = updatedContent.findIndex(entry => entry.timestamp === today);

  if (todayIndex > -1) {
    updatedContent[todayIndex].discordMessageCount =
      (updatedContent[todayIndex].discordMessageCount || 0) + 1;
  } else {
    updatedContent.push({ timestamp: today, discordMessageCount: 1 });
  }

  await messagesCountRef.set(updatedContent);
}



async function handleChatUtility(userId) {
  await Promise.all([
    saveToRealtimeDatabase(userId)
  ]);
}

module.exports = handleChatUtility;