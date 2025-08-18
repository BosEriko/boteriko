const firebaseUtility = require('@global/utilities/firebase');

const update_user_discord_id = async (uid, discordId) => {
  const db = firebaseUtility.firestore();
  await db.collection('users').doc(uid).set({ discordId }, { merge: true });
};

module.exports = update_user_discord_id;