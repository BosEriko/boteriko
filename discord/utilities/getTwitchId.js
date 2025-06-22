const firebaseUtility = require('@global/utilities/firebase');
const cacheUtility = require('@global/utilities/cache');

const discordToTwitchCache = cacheUtility();

async function getTwitchIdUtility(discordId) {
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

module.exports = getTwitchIdUtility;
