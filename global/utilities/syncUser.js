async function syncUserUtility(auth, user) {
  try {
    await auth.updateUser(user.id, {
      displayName: user.display_name,
      profileImage: user.profile_image_url
    });
  } catch (error) {
    if (error.code === 'auth/user-not-found') {
      await auth.createUser({
        uid: user.id,
        displayName: user.display_name,
        profileImage: user.profile_image_url
      });
    } else {
      console.error(`Failed to sync Firebase user: ${error.message}`);
    }
  }
}

module.exports = syncUserUtility;
