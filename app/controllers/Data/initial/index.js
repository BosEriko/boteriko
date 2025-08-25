const express = require('express');
const verify_firebase_token = require("../../concerns/verify_firebase_token");
const cacheUtility = require('@global/utilities/cache');

const initial = express.Router();

const CACHE_DURATION = 30 * 60 * 1000;
const initialDataCache = cacheUtility(CACHE_DURATION);

initial.get('/', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const token = await verify_firebase_token(authHeader.split(" ")[1]);
    const uid = token.uid;

    const cached = initialDataCache.get(uid, 'initial-data');
    if (cached) {
      const now = Date.now();
      const timeElapsed = now - cached.cachedAt;
      const remaining = Math.max(CACHE_DURATION - timeElapsed, 0);
      return res.json({ ...cached, cacheExpiresIn: remaining });
    }

    const user = await Model.User.find(uid);

    if (!user) {
      return res.status(404).json({ success: false, message: "User doesn't exist" });
    }

    if (!user.attributes?.isRegistered) {
      return res.status(400).json({ success: false, message: "User is not registered" });
    }

    const data = {
      success: true,
      cachedAt: Date.now(),
      user,
    }

    const connection = await Model.Connection.find(uid);
    if (connection) data.connection = connection;

    initialDataCache.set(uid, data, 'initial-data');

    res.json({ ...data, cacheExpiresIn: CACHE_DURATION });
  } catch (err) {
    await Utility.error_logger("Initial Data fetching error:", err?.response?.data || err.message);
    res.status(500).json({ success: false, message: "Fetching of Initial Data failed." });
  }
});

module.exports = initial;
