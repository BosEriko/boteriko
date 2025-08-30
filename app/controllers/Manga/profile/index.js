const express = require('express');
const axios = require('axios');
const verify_firebase_token = require("../../concerns/verify_firebase_token");

const profile = express.Router();
const cacheUtility = require('@global/utilities/cache');

const CACHE_DURATION = 60 * 60 * 1000;
const mangaCache = cacheUtility(CACHE_DURATION);

profile.get('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const token = await verify_firebase_token(authHeader.split(" ")[1]);
    const uid = token.uid;

    const user = await Model.User.find(uid);

    if (!user) {
      return res.status(404).json({ success: false, message: "User doesn't exist" });
    }

    if (!user.attributes?.isRegistered) {
      return res.status(400).json({ success: false, message: "User is not registered" });
    }

    const cached = mangaCache.get(id, 'manga');
    if (cached) {
      const now = Date.now();
      const timeElapsed = now - cached.cachedAt;
      const remaining = Math.max(CACHE_DURATION - timeElapsed, 0);
      return res.json({ ...cached, cacheExpiresIn: remaining });
    }

    const response = await axios.get(`https://api.jikan.moe/v4/manga/${id}`);

    if (!response.data || !response.data.data) {
      return res.status(404).json({ success: false, message: "Manga not found" });
    }

    const manga = response.data.data;
    const data = {
      success: true,
      cachedAt: Date.now(),
      information: {
        id: manga.mal_id,
        name: manga.title,
        description: manga.synopsis || "No description available",
        releaseDate: manga.published?.from || null,
        coverPhoto: manga.images?.jpg?.large_image_url || manga.images?.jpg?.image_url || null,
        displayPicture: manga.images?.jpg?.image_url || null
      }
    };

    mangaCache.set(id, data, 'manga');
    res.json({ ...data, cacheExpiresIn: CACHE_DURATION });
  } catch (err) {
    await Utility.error_logger('Failed to fetch Manga profile:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = profile;
