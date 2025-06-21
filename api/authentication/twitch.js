const express = require('express');
const axios = require('axios');
const firebaseUtility = require('@global/utilities/firebase');
const env = require('@global/utilities/env');

const router = express.Router();
const db = firebaseUtility.firestore();

// URL: /api/authentication/twitch
router.get('/authentication/twitch', async (req, res) => {
  const code = req.query.code;

  try {
    const tokenRes = await axios.post('https://id.twitch.tv/oauth2/token', null, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      params: {
        client_id: env.twitch.app.clientId,
        client_secret: env.twitch.app.clientSecret,
        code,
        grant_type: 'authorization_code',
        redirect_uri: env.twitch.app.redirectUrl,
      },
    });

    const { access_token } = tokenRes.data;

    const userRes = await axios.get('https://api.twitch.tv/helix/users', {
      headers: {
        Authorization: `Bearer ${access_token}`,
        'Client-Id': env.twitch.app.clientId,
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

    res.redirect(`${env.app.clientUrl}/authenticate?token=${customToken}`);
  } catch (error) {
    console.error('OAuth error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
});

module.exports = router;
