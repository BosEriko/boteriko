const express = require('express');
const axios = require('axios');
const verify_firebase_token = require("../../concerns/verify_firebase_token");

const profile = express.Router();
const cacheUtility = require('@global/utilities/cache');

const CACHE_DURATION = 60 * 60 * 1000;
const gameCache = cacheUtility(CACHE_DURATION);

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

    const cached = gameCache.get(id, 'game');
    if (cached) {
      const now = Date.now();
      const timeElapsed = now - cached.cachedAt;
      const remaining = Math.max(CACHE_DURATION - timeElapsed, 0);
      return res.json({ ...cached, cacheExpiresIn: remaining });
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
      `fields id, name, cover.url, first_release_date, summary;
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
      cachedAt: Date.now(),
      information: {
        id: game.id,
        name: game.name,
        description: game.summary || "No description available",
        releaseDate: game.first_release_date ? new Date(game.first_release_date * 1000).toISOString() : null,
        coverPhoto: game.cover?.url ? game.cover.url.replace("t_thumb", "t_1080p") : null,
        displayPicture: game.cover?.url ? game.cover.url.replace("t_thumb", "t_cover_big") : null
      }
    };

    gameCache.set(id, data, 'game');
    res.json({ ...data, cacheExpiresIn: CACHE_DURATION });
  } catch (err) {
    await Utility.error_logger('Failed to fetch Game profile:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = profile;
