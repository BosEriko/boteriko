const firebase_admin = require("../firebase_admin");

const sync_firebase_user = async (user) => {
  try {
    await firebase_admin.auth().updateUser(user.id, {
      email: user?.email,
      displayName: user?.display_name,
      photoURL: user?.profile_image_url,
    });
  } catch (err) {
    if (err.code === 'auth/user-not-found') {
      await firebase_admin.auth().createUser({
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