const express = require('express');

const get_account_information = express.Router();

const spotifyScopes = [
  { name: 'app-remote-control', isEnabled: false },
  { name: 'playlist-modify-private', isEnabled: false },
  { name: 'playlist-modify-public', isEnabled: false },
  { name: 'playlist-read-collaborative', isEnabled: false },
  { name: 'playlist-read-private', isEnabled: false },
  { name: 'streaming', isEnabled: false },
  { name: 'ugc-image-upload', isEnabled: false },
  { name: 'user-follow-modify', isEnabled: false },
  { name: 'user-follow-read', isEnabled: false },
  { name: 'user-library-modify', isEnabled: false },
  { name: 'user-library-read', isEnabled: false },
  { name: 'user-modify-playback-state', isEnabled: true },
  { name: 'user-read-currently-playing', isEnabled: true },
  { name: 'user-read-email', isEnabled: false },
  { name: 'user-read-playback-position', isEnabled: false },
  { name: 'user-read-playback-state', isEnabled: true },
  { name: 'user-read-private', isEnabled: false },
  { name: 'user-read-recently-played', isEnabled: false },
  { name: 'user-top-read', isEnabled: false },
];


get_account_information.get('/', async (req, res) => {
  const scopes = spotifyScopes.filter(scope => scope.isEnabled).map(scope => scope.name).join(' ');
  const authUrl = `https://accounts.spotify.com/authorize?response_type=code&client_id=${env.other.spotify.clientId}&scope=${encodeURIComponent(scopes)}&redirect_uri=${encodeURIComponent(env.other.spotify.redirectUrl)}`;

  res.redirect(authUrl);
});

module.exports = get_account_information;
