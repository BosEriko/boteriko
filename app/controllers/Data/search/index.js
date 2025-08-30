const express = require("express");
const verify_firebase_token = require("../../concerns/verify_firebase_token");
const search_games = require("./game");
const search_anime = require("./anime");
const search_manga = require("./manga");

const search = express.Router();

const searchCache = new Map();
const CACHE_TTL = 30 * 60 * 1000;

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
      return res.status(404).json({ success: false, message: "User doesn't exist" });
    }

    if (!user.attributes?.isRegistered) {
      return res.status(400).json({ success: false, message: "User is not registered" });
    }

    const searchQuery = req.query.query;
    if (!searchQuery || searchQuery.trim() === "") {
      return res.status(400).json({ success: false, message: "Search query is required." });
    }

    const cacheKey = searchQuery.toLowerCase();
    const cached = searchCache.get(cacheKey);
    const now = Date.now();

    if (cached && now - cached.timestamp < CACHE_TTL) {
      return res.json({ success: true, results: cached.data });
    }

    const [games, anime, manga] = await Promise.all([
      search_games(searchQuery),
      search_anime(searchQuery),
      search_manga(searchQuery),
    ]);

    const results = { games, anime, manga };

    // Save to cache
    searchCache.set(cacheKey, { timestamp: now, data: results });

    res.json({ success: true, results });
  } catch (err) {
    await Utility.error_logger("Game/Anime/Manga Search error:", err?.response?.data || err.message);

    if (err?.response?.status === 429) {
      return res.status(429).json({
        success: false,
        message: "You're being rate-limited by the Jikan API. Please try again in a few seconds.",
      });
    }

    res.status(500).json({ success: false, message: "Searching failed." });
  }
});

module.exports = search;
