const firebaseUtility = require('@global/utilities/firebase');

module.exports = async function verifyFirebaseToken(state) {
  const decoded = await firebaseUtility.auth().verifyIdToken(state);
  return decoded.uid;
};
