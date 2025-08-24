const express = require('express');
const profile = express.Router();
const cacheUtility = require('@global/utilities/cache');

const CACHE_DURATION = 30 * 60 * 1000;
const profileCache = cacheUtility(CACHE_DURATION);

profile.get('/:uid', async (req, res) => {
  const { uid } = req.params;

  try {
    const cached = profileCache.get(uid, 'profile');
    if (cached) return res.json(cached);

    const user = await Model.User.find(uid);

    if (!user) {
      return res.status(404).json({ success: false, message: "User doesn't exist" });
    }

    if (!user.attributes?.isRegistered) {
      return res.status(400).json({ success: false, message: "User is not registered" });
    }

    const data = {
      success: true,
      cacheExpiresIn: CACHE_DURATION,
      user,
    };

    const connection = await Model.Connection.find(uid);
    if (connection) data.connection = connection;

    const wallet = await Model.Wallet.find(uid);
    if (wallet) data.wallet = wallet;

    const statistic = await Model.Statistic.find(uid);
    if (statistic) data.statistic = statistic;

    const daily = await Model.Daily.find(uid);
    if (daily) data.daily = daily;

    profileCache.set(uid, data, 'profile');

    res.json(data);
  } catch (err) {
    await Utility.error_logger('Failed to fetch profile:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = profile;
