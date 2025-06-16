const express = require('express');
const axios = require('axios');
const firebaseUtility = require('../../global/utilities/firebase');

const router = express.Router();
const db = firebaseUtility.firestore();

router.get('/twitch', async (req, res) => {
  const code = req.query.code;

  try {
    const tokenRes = await axios.post('https://id.twitch.tv/oauth2/token', null, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      params: {
        client_id: process.env.TWITCH_CLIENT_ID,
        client_secret: process.env.TWITCH_CLIENT_SECRET,
        code,
        grant_type: 'authorization_code',
        redirect_uri: process.env.TWITCH_REDIRECT_URI,
      },
    });

    const { access_token } = tokenRes.data;

    const userRes = await axios.get('https://api.twitch.tv/helix/users', {
      headers: {
        Authorization: `Bearer ${access_token}`,
        'Client-Id': process.env.TWITCH_CLIENT_ID,
      },
    });

    const twitchUser = userRes.data.data[0];
    const uid = twitchUser.id;

    if (twitchUser.email) {
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
    }

    const customToken = await firebaseUtility.auth().createCustomToken(uid, {
      displayName: twitchUser.display_name,
      profileImage: twitchUser.profile_image_url,
    });

    await db.collection('users').doc(uid).set({
      displayName: twitchUser.display_name,
      profileImage: twitchUser.profile_image_url,
    }, { merge: true });

    res.redirect(`/authenticate?token=${customToken}`);
  } catch (error) {
    console.error('OAuth error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
});

module.exports = router;
