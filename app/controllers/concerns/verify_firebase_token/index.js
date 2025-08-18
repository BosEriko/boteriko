const firebaseUtility = require('@global/utilities/firebase');

const verify_firebase_token = async (token) => {
  return await firebaseUtility.auth().verifyIdToken(token);
};

module.exports = verify_firebase_token;
