const firebaseUtility = require('@global/utilities/firebase');

const generate_custom_token = async (uid, twitchUser) => {
  return firebaseUtility.auth().createCustomToken(uid, {
    displayName: twitchUser.display_name,
    profileImage: twitchUser.profile_image_url,
  });
};

module.exports = generate_custom_token;