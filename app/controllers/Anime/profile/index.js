const express = require('express');
const axios = require('axios');
const verify_firebase_token = require("../../concerns/verify_firebase_token");

const profile = express.Router();
const cacheUtility = require('@global/utilities/cache');

const CACHE_DURATION = 60 * 60 * 1000;
const animeCache = cacheUtility(CACHE_DURATION);

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

    const cached = animeCache.get(id, 'anime');
    if (cached) {
      const now = Date.now();
      const timeElapsed = now - cached.cachedAt;
      const remaining = Math.max(CACHE_DURATION - timeElapsed, 0);
      return res.json({ ...cached, cacheExpiresIn: remaining });
    }

    const response = await axios.get(`https://api.jikan.moe/v4/anime/${id}`);

    if (!response.data || !response.data.data) {
      return res.status(404).json({ success: false, message: "Anime not found" });
    }

    const anime = response.data.data;
    const data = {
      success: true,
      cachedAt: Date.now(),
      information: {
        id: anime.mal_id,
        name: anime.title,
        description: anime.synopsis || "No description available",
        releaseDate: anime.aired?.from || null,
        coverPhoto: anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url || null,
        displayPicture: anime.images?.jpg?.image_url || null,
        nsfw: anime.nsfw === "black"
      }
    };

    animeCache.set(id, data, 'anime');
    res.json({ ...data, cacheExpiresIn: CACHE_DURATION });
  } catch (err) {
    await Utility.error_logger('Failed to fetch Anime profile:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = profile;
