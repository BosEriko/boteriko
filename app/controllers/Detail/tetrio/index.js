const express = require('express');
const tetrio = express.Router();

tetrio.get('/', async (req, res) => {
  const { username } = req.query;

  if (!username) {
    return res.status(400).json({ error: 'Missing username parameter' });
  }

  try {
    const response = await fetch(`https://ch.tetr.io/api/users/${username}`);
    const json = await response.json();

    if (!json.success) {
      return res.status(404).json({ error: 'TETR.IO user not found' });
    }

    return res.json(json.data);
  } catch (err) {
    await Utility.error_logger('[TETR.IO API Error]', err);
    return res.status(500).json({ error: 'Failed to fetch TETR.IO data' });
  }
});

module.exports = tetrio;
