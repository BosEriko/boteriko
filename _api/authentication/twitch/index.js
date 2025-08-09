const express = require('express');
const firebaseUtility = require('@global/utilities/firebase');

const exchangeCode = require('./exchangeCode');
const fetchUser = require('./fetchUser');
const syncFirebaseUser = require('./syncFirebaseUser');
const generateCustomToken = require('./generateCustomToken');

const router = express.Router();
const db = firebaseUtility.firestore();

router.get('/', async (req, res) => {
  const code = req.query.code;

  try {
    const accessToken = await exchangeCode(code);
    const twitchUser = await fetchUser(accessToken);

    const uid = twitchUser.id;
    await syncFirebaseUser(uid, twitchUser);
    const customToken = await generateCustomToken(uid, twitchUser);

    await db.collection('users').doc(uid).set({
      displayName: twitchUser.display_name,
      profileImage: twitchUser.profile_image_url,
    }, { merge: true });

    res.redirect(`${Config.app.clientUrl}/authenticate?token=${customToken}`);
  } catch (error) {
    await Utility.error_logger('OAuth error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
});

module.exports = router;
