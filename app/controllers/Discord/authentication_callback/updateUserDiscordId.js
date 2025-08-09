const firebaseUtility = require('@global/utilities/firebase');

module.exports = async function updateUserDiscordId(uid, discordId) {
  const db = firebaseUtility.firestore();
  await db.collection('users').doc(uid).set({ discordId }, { merge: true });
};
