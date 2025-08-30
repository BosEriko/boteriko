const express = require("express");
const axios = require("axios");
const verify_firebase_token = require("../../concerns/verify_firebase_token");

const search = express.Router();

// Simple in-memory cache for Jikan results (anime + manga)
const jikanCache = new Map();
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes

// Small delay helper to respect Jikan rate limits
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

search.post("/", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const token = await verify_firebase_token(authHeader.split(" ")[1]);
    const uid = token.uid;

    const user = await Model.User.find(uid);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User doesn't exist" });
    }

    if (!user.attributes?.isRegistered) {
      return res
        .status(400)
        .json({ success: false, message: "User is not registered" });
    }

    const searchQuery = req.query.query;
    if (!searchQuery || searchQuery.trim() === "") {
      return res
        .status(400)
        .json({ success: false, message: "Search query is required." });
    }

    const clientId = Config.twitch.app.clientId;
    const clientSecret = Config.twitch.app.clientSecret;

    // Fetch Twitch access token
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

    // Check Jikan cache first
    const cacheKey = searchQuery.toLowerCase();
    const cached = jikanCache.get(cacheKey);
    const now = Date.now();

    if (cached && now - cached.timestamp < CACHE_TTL) {
      return res.json({ success: true, results: cached.data });
    }

    // Make all requests in parallel
    const [igdbResponse, animeResponse] = await Promise.all([
      // IGDB Games
      axios.post(
        `https://api.igdb.com/v4/games`,
        `fields name, slug, cover.url, first_release_date, summary, parent_game;
        where name ~ *"${searchQuery}"* & parent_game = null;
        sort first_release_date desc;
        limit 10;`,
        {
          headers: {
            "Client-ID": clientId,
            Authorization: `Bearer ${accessToken}`,
            Accept: "application/json",
          },
        }
      ),

      // Anime
      axios.get(`https://api.jikan.moe/v4/anime`, {
        params: {
          q: searchQuery,
          limit: 10,
        },
      }),
    ]);

    // Add a slight delay before fetching manga to avoid hitting Jikan's limit
    await delay(150);

    const mangaResponse = await axios.get(`https://api.jikan.moe/v4/manga`, {
      params: {
        q: searchQuery,
        limit: 10,
      },
    });

    const results = {
      games: igdbResponse.data || [],
      anime: animeResponse.data.data || [],
      manga: mangaResponse.data.data || [],
    };

    // Save to cache
    jikanCache.set(cacheKey, { timestamp: now, data: results });

    res.json({ success: true, results });
  } catch (err) {
    await Utility.error_logger(
      "Game/Anime/Manga Search error:",
      err?.response?.data || err.message
    );

    if (err?.response?.status === 429) {
      return res.status(429).json({
        success: false,
        message:
          "You're being rate-limited by Jikan API. Please try again in a few seconds.",
      });
    }

    res.status(500).json({ success: false, message: "Searching failed." });
  }
});

module.exports = search;
