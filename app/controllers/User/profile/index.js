const express = require('express');
const profile = express.Router();

const cache = {};
const CACHE_DURATION = 15 * 60 * 1000;

profile.get('/:uid', async (req, res) => {
  const { uid } = req.params;

  const cached = cache[uid];
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return res.json(cached.data);
  }

  try {
    const user = await Model.User.find(uid);

    if (!user) {
      return res.status(404).json({ success: false, message: "User doesn't exist" });
    }

    if (!user.attributes?.isRegistered) {
      return res.status(400).json({ success: false, message: "User is not registered" });
    }

    const data = {
      success: true,
      user,
    };

    const connection = await Model.Connection.find(uid);
    if (connection) data.connection = connection;

    cache[uid] = {
      data,
      timestamp: Date.now(),
    };

    res.json(data);
  } catch (err) {
    await Utility.error_logger('Failed to fetch profile:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = profile;
