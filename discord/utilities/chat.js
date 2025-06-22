const firebaseUtility = require('@global/utilities/firebase');
const cacheUtility = require('@global/utilities/cache');
const attendanceUtility = require('@global/utilities/attendance');
const statisticUtility = require('@global/utilities/statistic');

const discordToTwitchCache = cacheUtility();

async function getTwitchIdFromDiscordId(discordId) {
  const cached = discordToTwitchCache.get(discordId, 'discord-to-twitch');
  if (cached) return cached;

  const firestore = firebaseUtility.firestore();
  const usersRef = firestore.collection('users');
  const snapshot = await usersRef.where('discordId', '==', discordId).limit(1).get();

  if (snapshot.empty) {
    console.log("User not found in Firestore, skipping.");
    return null;
  }

  const doc = snapshot.docs[0];
  const twitchId = doc.id;

  discordToTwitchCache.set(discordId, twitchId, 'discord-to-twitch');

  return twitchId;
}

async function saveToRealtimeDatabase(discordId) {
  const rtdb = firebaseUtility.database();
  const twitchId = await getTwitchIdFromDiscordId(discordId);
  if (!twitchId) return;

  await statisticUtility(rtdb, twitchId, { discordMessageCount: 1, coins: 1 });
  await attendanceUtility(rtdb, twitchId, 'discordMessageCount');
}

async function handleChatUtility(discordId) {
  await saveToRealtimeDatabase(discordId);
}

module.exports = handleChatUtility;
