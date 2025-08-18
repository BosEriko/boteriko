const express = require('express');

const authentication_connect = express.Router();

const discordScopes = [
  { name: 'connections', isEnabled: false },
  { name: 'email', isEnabled: false },
  { name: 'guilds.join', isEnabled: false },
  { name: 'guilds', isEnabled: false },
  { name: 'identify', isEnabled: true },
  { name: 'messages.read', isEnabled: false },
];

authentication_connect.get('/', async (req, res) => {
  const firebaseToken = req.query.token;
  if (!firebaseToken) return res.status(400).json({ error: 'Missing token' });

  const scopes = discordScopes.filter(scope => scope.isEnabled).map(scope => scope.name).join(' ');
  const params = new URLSearchParams({
    client_id: Config.discord.app.clientId,
    redirect_uri: Config.discord.app.redirectUrl,
    response_type: 'code',
    scope: scopes,
    state: firebaseToken,
  });
  const authUrl = `https://discord.com/oauth2/authorize?${params.toString()}`;

  res.redirect(authUrl);
});

module.exports = authentication_connect;