const express = require('express');
const handleUserUtility = require('@global/utilities/user');
const twitch = express.Router();

twitch.get('/', async (req, res) => {
  const { username, id } = req.query;

  if (!username && !id) {
    return res.status(400).json({ error: 'Missing username or id parameter' });
  }

  try {
    const user = await handleUserUtility(username || id);

    if (!user) {
      return res.status(404).json({ error: 'Twitch user not found' });
    }

    return res.json(user);
  } catch (err) {
    console.error('Error fetching Twitch user:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = twitch;
