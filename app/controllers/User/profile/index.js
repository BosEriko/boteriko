const express = require('express');
const profile = express.Router();

const cache = {};
const CACHE_DURATION = 15 * 60 * 1000;

function getPastYearDates() {
  const dates = [];
  const today = new Date();
  const start = new Date(today);
  start.setFullYear(start.getFullYear() - 1);

  for (let d = new Date(start); d <= today; d.setDate(d.getDate() + 1)) {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    dates.push(`${yyyy}-${mm}-${dd}`);
  }
  return dates;
}

profile.get('/:uid', async (req, res) => {
  const { uid } = req.params;

  const cached = cache[uid];
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return res.json(cached.data);
  }

  try {
    const user = await Model.User.find(uid);

    if (!user) return res.status(404).json({ success: false, message: "User doesn't exist" });
    if (!user.attributes?.isRegistered) return res.status(400).json({ success: false, message: "User is not registered" });

    const data = { success: true, user };

    const connection = await Model.Connection.find(uid);
    if (connection) data.connection = connection;

    const wallet = await Model.Wallet.find(uid);
    if (wallet) data.wallet = wallet;

    const statistic = await Model.Statistic.find(uid);
    if (statistic) data.statistic = statistic;

    const daily = await Model.Daily.find(uid);
    if (daily) {
      const pastYearDates = getPastYearDates();
      const content = daily.attributes?.content || {};

      const discord = [];
      const twitch = [];

      pastYearDates.forEach(date => {
        discord.push({
          date,
          count: content[date]?.discordMessageCount || 0
        });
        twitch.push({
          date,
          count: content[date]?.twitchMessageCount || 0
        });
      });

      data.daily = {
        discord,
        twitch
      };
    }

    cache[uid] = { data, timestamp: Date.now() };

    res.json(data);
  } catch (err) {
    await Utility.error_logger('Failed to fetch profile:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = profile;
