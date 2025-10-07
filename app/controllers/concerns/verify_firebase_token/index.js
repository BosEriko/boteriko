const firebase_admin = require("../firebase_admin");

const verify_firebase_token = async (token) => {
  return await firebase_admin.auth().verifyIdToken(token);
};

module.exports = verify_firebase_token;
