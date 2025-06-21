const firebaseUtility = require('@global/utilities/firebase');

const firestore = firebaseUtility.firestore();
const rtdb = firebaseUtility.database();

const discordToTwitchCache = new Map();

function getCacheKey(discordId) {
  return `discord-${discordId}`;
}

function cacheTwitchId(discordId, twitchId) {
  const expiresAt = Date.now() + 24 * 60 * 60 * 1000;
  discordToTwitchCache.set(getCacheKey(discordId), { twitchId, expiresAt });
}

function getCachedTwitchId(discordId) {
  const cached = discordToTwitchCache.get(getCacheKey(discordId));
  if (cached && cached.expiresAt > Date.now()) {
    return cached.twitchId;
  }
  discordToTwitchCache.delete(getCacheKey(discordId));
  return null;
}

async function getTwitchIdFromDiscord(discordId) {
  const cached = getCachedTwitchId(discordId);
  if (cached) return cached;

  const usersRef = firestore.collection('users');
  const snapshot = await usersRef.where('discordId', '==', discordId).limit(1).get();

  if (snapshot.empty) {
    console.log("User not found in Firestore, skipping.");
    return null;
  }

  const doc = snapshot.docs[0];
  const twitchId = doc.id;

  cacheTwitchId(discordId, twitchId);

  return twitchId;
}

async function saveToRealtimeDatabase(discordId) {
  const twitchId = await getTwitchIdFromDiscord(discordId);
  if (!twitchId) return;

  const userRef = rtdb.ref(`users/${twitchId}`);
  const userSnap = await userRef.once('value');
  const userData = userSnap.val() || {};

  await userRef.update({
    discordMessageCount: (userData.discordMessageCount || 0) + 1,
    coins: (userData.coins || 0) + 1,
  });

  const today = new Date().toISOString().slice(0, 10);
  const messagesCountRef = rtdb.ref(`messages_counts/${twitchId}/content`);
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

async function handleChatUtility(discordId) {
  await saveToRealtimeDatabase(discordId);
}

module.exports = handleChatUtility;
