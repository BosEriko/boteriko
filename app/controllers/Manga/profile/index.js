const express = require('express');
const axios = require('axios');
const verify_firebase_token = require("../../concerns/verify_firebase_token");

const profile = express.Router();
const cacheUtility = require('@global/utilities/cache');

const CACHE_DURATION = 60 * 60 * 1000;
const DB_CACHE_DURATION = 7 * 24 * 60 * 60 * 1000;
const mangaCache = cacheUtility(CACHE_DURATION);

profile.get('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    let user = null;
    const authHeader = req.headers.authorization;

    if (authHeader?.startsWith("Bearer ")) {
      try {
        const token = await verify_firebase_token(authHeader.split(" ")[1]);
        const uid = token.uid;
        user = await Model.User.find(uid);
      } catch (error) {
        return res.status(401).json({ success: false, message: "Invalid token" });
      }
    }

    if (user) {
      // Fetch the User's Progress
    }

    const cached = mangaCache.get(id, 'manga');
    if (cached) return res.json({ ...cached, cacheExpiresIn: Math.max(CACHE_DURATION - (Date.now() - cached.cachedAt), 0) });

    let dbProfile = await Model.MangaProfile.find(id);
    const now = Date.now();

    if (dbProfile && now - dbProfile.attributes.timestamp < DB_CACHE_DURATION) {
      const data = {
        success: true,
        cachedAt: dbProfile.attributes.timestamp,
        information: {
          id: dbProfile.attributes.id,
          name: dbProfile.attributes.name,
          description: dbProfile.attributes.description,
          releaseDate: dbProfile.attributes.releaseDate,
          coverPhoto: dbProfile.attributes.coverPhoto,
          displayPicture: dbProfile.attributes.displayPicture,
          nsfw: dbProfile.attributes.nsfw,
        },
      };

      mangaCache.set(id, data, 'manga');
      return res.json({ ...data, cacheExpiresIn: Math.max(DB_CACHE_DURATION - (Date.now() - dbProfile.attributes.timestamp), 0) });
    }

    const response = await axios.get(`https://api.jikan.moe/v4/manga/${id}`);

    if (!response.data || !response.data.data) {
      return res.status(404).json({ success: false, message: "Manga not found" });
    }

    const manga = response.data.data;
    const data = {
      success: true,
      cachedAt: now,
      information: {
        id: manga.mal_id,
        name: manga.title,
        description: manga.synopsis || "No description available",
        releaseDate: manga.published?.from || null,
        coverPhoto: manga.images?.jpg?.large_image_url || manga.images?.jpg?.image_url || null,
        displayPicture: manga.images?.jpg?.image_url || null,
        nsfw: manga.nsfw === "black" || manga.genres?.some(g => g.name === "Hentai") || manga.themes?.some(t => t.name === "Hentai")
      }
    };

    await Model.MangaProfile.find_or_upsert_by({
      timestamp: now,
      id: data.information.id,
      name: data.information.name,
      description: data.information.description,
      releaseDate: data.information.releaseDate,
      coverPhoto: data.information.coverPhoto,
      displayPicture: data.information.displayPicture,
      nsfw: data.information.nsfw,
    }, id);

    mangaCache.set(id, data, 'manga');
    res.json({ ...data, cacheExpiresIn: CACHE_DURATION });
  } catch (err) {
    await Utility.error_logger('Failed to fetch Manga profile:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = profile;
