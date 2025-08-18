const firebaseUtility = require('@global/utilities/firebase');

const sync_firebase_user = async (uid, twitchUser) => {
  if (!twitchUser.email) return;

  try {
    await firebaseUtility.auth().updateUser(uid, {
      email: twitchUser.email,
      displayName: twitchUser.display_name,
      photoURL: twitchUser.profile_image_url,
    });
  } catch (err) {
    if (err.code === 'auth/user-not-found') {
      await firebaseUtility.auth().createUser({
        uid,
        email: twitchUser.email,
        displayName: twitchUser.display_name,
        photoURL: twitchUser.profile_image_url,
      });
    } else {
      throw err;
    }
  }
};

module.exports = sync_firebase_user;