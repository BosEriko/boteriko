const express = require('express');

const verifyFirebaseToken = require('./verifyFirebaseToken');
const exchangeCode = require('./exchangeCode');
const fetchUser = require('./fetchUser');
const updateUserDiscordId = require('./updateUserDiscordId');

const authentication_callback = express.Router();

authentication_callback.get('/', async (req, res) => {
  const { code, state } = req.query;

  if (!code || !state) {
    return res.status(400).json({ error: 'Missing code or firebaseToken' });
  }

  try {
    const uid = await verifyFirebaseToken(state);
    const accessToken = await exchangeCode(code);
    const discordUser = await fetchUser(accessToken);

    await updateUserDiscordId(uid, discordUser.id);

    return res.redirect(`${Config.app.clientUrl}/?discord_connected=1`);
  } catch (err) {
    await Utility.error_logger('Discord OAuth error:', err);
    return res.status(500).json({ error: 'Discord connection failed' });
  }
});

module.exports = authentication_callback;
