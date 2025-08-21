const firebaseUtility = require('@global/utilities/firebase');

const sync_firebase_user = async (user) => {
  try {
    await firebaseUtility.auth().updateUser(user.id, {
      email: user?.email,
      displayName: user?.display_name,
      photoURL: user?.profile_image_url,
    });
  } catch (err) {
    if (err.code === 'auth/user-not-found') {
      await firebaseUtility.auth().createUser({
        uid: user.id,
        email: user?.email,
        displayName: user?.display_name,
        photoURL: user?.profile_image_url,
      });
    } else {
      await Utility.error_logger(`Failed to sync Firebase user: ${error.message}`);
    }
  }
};

module.exports = sync_firebase_user;