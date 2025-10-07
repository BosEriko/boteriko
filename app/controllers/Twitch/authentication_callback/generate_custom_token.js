const firebase_admin = require("../../concerns/firebase_admin");

const generate_custom_token = async (uid, twitchUser) => {
  return firebase_admin.auth().createCustomToken(uid, {
    displayName: twitchUser.display_name,
    profileImage: twitchUser.profile_image_url,
  });
};

module.exports = generate_custom_token;