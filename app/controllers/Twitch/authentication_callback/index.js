const express = require('express');

const exchange_code = require('./exchange_code');
const fetch_user = require('./fetch_user');
const sync_firebase_user = require('./sync_firebase_user');
const generate_custom_token = require('./generate_custom_token');

const authentication_callback = express.Router();

authentication_callback.get('/', async (req, res) => {
  const code = req.query.code;

  try {
    const accessToken = await exchange_code(code);
    const twitchUser = await fetch_user(accessToken);

    const uid = twitchUser.id;
    await sync_firebase_user(uid, twitchUser);
    const customToken = await generate_custom_token(uid, twitchUser);

    await Model.User.find_or_upsert_by({
      displayName: twitchUser.display_name,
      profileImage: twitchUser.profile_image_url,
      isRegistered: true,
    }, uid);

    res.redirect(`${Config.app.clientUrl}/authenticate?token=${customToken}`);
  } catch (error) {
    await Utility.error_logger('OAuth error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
});

module.exports = authentication_callback;
