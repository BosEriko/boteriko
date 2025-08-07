const express = require('express');
const router = express.Router();
const handleUserUtility = require('@global/utilities/user');

router.get('/', async (req, res) => {
  const { username } = req.query;

  if (!username) {
    return res.status(400).json({ error: 'Missing username parameter' });
  }

  const user = await handleUserUtility(username);

  if (!user) {
    return res.status(404).json({ error: 'Twitch user not found' });
  }

  return res.json(user);
});

module.exports = router;
