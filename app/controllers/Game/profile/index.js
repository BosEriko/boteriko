const express = require('express');
const axios = require('axios');
const verify_firebase_token = require("../../concerns/verify_firebase_token");

const profile = express.Router();
const cacheUtility = require('@global/utilities/cache');

const CACHE_DURATION = 60 * 60 * 1000;
const DB_CACHE_DURATION = 7 * 24 * 60 * 60 * 1000;
const gameCache = cacheUtility(CACHE_DURATION);

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
    if (user) list = await Model.GameList.find_by({ id }, user.id);

    const cached = gameCache.get(id, 'game');
    if (cached) return res.json({ ...cached, list, cacheExpiresIn: Math.max(CACHE_DURATION - (Date.now() - cached.cachedAt), 0) });

    let dbProfile = await Model.GameProfile.find(id);
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

      gameCache.set(id, data, 'game');
      return res.json({ ...data, list, cacheExpiresIn: Math.max(DB_CACHE_DURATION - (Date.now() - dbProfile.attributes.timestamp), 0) });
    }

    const clientId = Config.twitch.app.clientId;
    const clientSecret = Config.twitch.app.clientSecret;

    const tokenResponse = await axios.post(
      `https://id.twitch.tv/oauth2/token`,
      null,
      {
        params: {
          client_id: clientId,
          client_secret: clientSecret,
          grant_type: "client_credentials",
        },
      }
    );

    const accessToken = tokenResponse.data.access_token;

    const response = await axios.post(
      "https://api.igdb.com/v4/games",
      `fields id, name, cover.url, first_release_date, summary, age_ratings.rating;
       where id = ${id};`,
      {
        headers: {
          "Client-ID": clientId,
          "Authorization": `Bearer ${accessToken}`,
          "Accept": "application/json",
        },
      }
    );

    if (!response.data || response.data.length === 0) {
      return res.status(404).json({ success: false, message: "Game not found" });
    }

    const game = response.data[0];
    const data = {
      success: true,
      cachedAt: now,
      information: {
        id: game.id,
        name: game.name,
        description: game.summary || "No description available",
        releaseDate: game.first_release_date ? new Date(game.first_release_date * 1000).toISOString() : null,
        coverPhoto: game.cover?.url ? game.cover.url.replace("t_thumb", "t_1080p") : null,
        displayPicture: game.cover?.url ? game.cover.url.replace("t_thumb", "t_cover_big") : null,
        nsfw: game.age_ratings?.some(rating => [6, 11].includes(rating.rating)) || false
      }
    };

    await Model.GameProfile.find_or_upsert_by({
      timestamp: now,
      id: data.information.id,
      name: data.information.name,
      description: data.information.description,
      releaseDate: data.information.releaseDate,
      coverPhoto: data.information.coverPhoto,
      displayPicture: data.information.displayPicture,
      nsfw: data.information.nsfw,
    }, id);

    gameCache.set(id, data, 'game');
    res.json({ ...data, list, cacheExpiresIn: CACHE_DURATION });
  } catch (err) {
    await Utility.error_logger('Failed to fetch Game profile:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = profile;
