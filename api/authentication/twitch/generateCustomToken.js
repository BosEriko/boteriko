const firebaseUtility = require('@global/utilities/firebase');

module.exports = function generateCustomToken(uid, twitchUser) {
  return firebaseUtility.auth().createCustomToken(uid, {
    displayName: twitchUser.display_name,
    profileImage: twitchUser.profile_image_url,
  });
};
