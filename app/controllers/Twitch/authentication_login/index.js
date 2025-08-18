const express = require('express');

const authentication_login = express.Router();

const twitchScopes = [
  { name: 'channel:read:editors', isEnabled: false },
  { name: 'channel:read:subscriptions', isEnabled: false },
  { name: 'chat:edit', isEnabled: false },
  { name: 'chat:read', isEnabled: false },
  { name: 'clips:edit', isEnabled: false },
  { name: 'user:read:broadcast', isEnabled: false },
  { name: 'user:read:email', isEnabled: true },
  { name: 'user:read:follows', isEnabled: false },
];

authentication_login.get('/', async (req, res) => {
  const scopes = twitchScopes.filter(scope => scope.isEnabled).map(scope => scope.name).join(' ');
  const params = new URLSearchParams({
    client_id: Config.twitch.app.clientId,
    redirect_uri: Config.twitch.app.redirectUrl,
    response_type: 'code',
    scope: scopes
  });
  const authUrl = `https://id.twitch.tv/oauth2/authorize?${params.toString()}`;

  res.redirect(authUrl);
});

module.exports = authentication_login;
