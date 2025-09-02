const express = require('express');
const axios = require('axios');
const verify_firebase_token = require("../../concerns/verify_firebase_token");

const profile = express.Router();
const cacheUtility = require('@global/utilities/cache');

const CACHE_DURATION = 60 * 60 * 1000;
const DB_CACHE_DURATION = 7 * 24 * 60 * 60 * 1000;
const animeCache = cacheUtility(CACHE_DURATION);

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

    let list;
    if (user) list = await Model.AnimeList.find_by({ id }, user.id);

    const cached = animeCache.get(id, 'anime');
    if (cached) return res.json({ ...cached, list, cacheExpiresIn: Math.max(CACHE_DURATION - (Date.now() - cached.cachedAt), 0) });

    let dbProfile = await Model.AnimeProfile.find(id);
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

      animeCache.set(id, data, 'anime');
      return res.json({ ...data, list, cacheExpiresIn: Math.max(DB_CACHE_DURATION - (Date.now() - dbProfile.attributes.timestamp), 0) });
    }

    const response = await axios.get(`https://api.jikan.moe/v4/anime/${id}`);

    if (!response.data || !response.data.data) {
      return res.status(404).json({ success: false, message: "Anime not found" });
    }

    const anime = response.data.data;
    const data = {
      success: true,
      cachedAt: now,
      information: {
        id: anime.mal_id,
        name: anime.title,
        description: anime.synopsis || "No description available",
        releaseDate: anime.aired?.from || null,
        coverPhoto: anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url || null,
        displayPicture: anime.images?.jpg?.image_url || null,
        nsfw: anime.nsfw === "black" || anime.genres?.some(g => g.name === "Hentai") || anime.themes?.some(t => t.name === "Hentai")
      }
    };

    await Model.AnimeProfile.find_or_upsert_by({
      timestamp: now,
      id: data.information.id,
      name: data.information.name,
      description: data.information.description,
      releaseDate: data.information.releaseDate,
      coverPhoto: data.information.coverPhoto,
      displayPicture: data.information.displayPicture,
      nsfw: data.information.nsfw,
    }, id);

    animeCache.set(id, data, 'anime');
    res.json({ ...data, list, cacheExpiresIn: CACHE_DURATION });
  } catch (err) {
    await Utility.error_logger('Failed to fetch Anime profile:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = profile;
