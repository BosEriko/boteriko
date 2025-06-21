const express = require('express');
const axios = require('axios');
const firebaseUtility = require('@global/utilities/firebase');
const env = require('@global/utilities/env');

const router = express.Router();
const db = firebaseUtility.firestore();

// URL: /api/authentication/discord
router.get('/authentication/discord', async (req, res) => {
  const { code, state } = req.query;

  if (!code || !state) {
    return res.status(400).json({ error: 'Missing code or firebaseToken' });
  }

  try {
    const decodedToken = await firebaseUtility.auth().verifyIdToken(state);
    const uid = decodedToken.uid;

    const tokenRes = await axios.post(
      'https://discord.com/api/oauth2/token',
      new URLSearchParams({
        client_id: env.discord.app.clientId,
        client_secret: env.discord.app.clientSecret,
        code,
        grant_type: 'authorization_code',
        redirect_uri: env.discord.app.redirectUrl,
      }),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );

    const { access_token } = tokenRes.data;

    const discordUserRes = await axios.get('https://discord.com/api/users/@me', {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    const discordUser = discordUserRes.data;

    await db.collection('users').doc(uid).set({
      discordId: discordUser.id,
    }, { merge: true });

    return res.redirect(`${env.app.clientUrl}/?discord_connected=1`);
  } catch (err) {
    console.error('Discord OAuth error:', err);
    return res.status(500).json({ error: 'Discord connection failed' });
  }
});

module.exports = router;
