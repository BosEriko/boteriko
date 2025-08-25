const express = require('express');

const verify_firebase_token = require('../../concerns/verify_firebase_token');
const exchange_code = require('./exchange_code');
const fetch_user = require('./fetch_user');

const authentication_callback = express.Router();

authentication_callback.get('/', async (req, res) => {
  const { code, state } = req.query;

  if (!code || !state) {
    return res.status(400).json({ error: 'Missing code or firebaseToken' });
  }

  try {
    const token = await verify_firebase_token(state);
    const uid = token.uid;
    const accessToken = await exchange_code(code);
    const discordUser = await fetch_user(accessToken);

    await Model.Connection.find_or_upsert_by({ discord: discordUser.id }, uid);

    return res.redirect(`${Config.app.clientUrl}/setting?discord=${discordUser.id}`);
  } catch (err) {
    await Utility.error_logger('Discord OAuth error:', err);
    return res.status(500).json({ error: 'Discord connection failed' });
  }
});

module.exports = authentication_callback;