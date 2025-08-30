const express = require("express");
const verify_firebase_token = require("../../concerns/verify_firebase_token");
const search_games = require("./game");
const search_anime = require("./anime");
const search_manga = require("./manga");
const cacheUtility = require("@global/utilities/cache");

const search = express.Router();

const THIRTY_MINUTES_MS = 30 * 60 * 1000;
const searchCache = cacheUtility(THIRTY_MINUTES_MS);

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const search_all = async (searchQuery) => {
  return await Promise.all([
    search_games(searchQuery),
    search_anime(searchQuery),
    search_manga(searchQuery),
  ]);
};

const fetchSearchResults = async (searchQuery) => {
  try {
    return await search_all(searchQuery);
  } catch (err) {
    if (err?.response?.status === 429) {
      console.warn(`[Rate Limit Hit] Retrying after 3s cooldown...`);
      await delay(3000);
      return await search_all(searchQuery);
    }

    throw err;
  }
};

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
    const cached = searchCache.get(cacheKey, "search-results");

    if (cached) {
      return res.json({ success: true, results: cached });
    }

    let games, anime, manga;
    try {
      [games, anime, manga] = await fetchSearchResults(searchQuery);
    } catch (err) {
      if (err?.response?.status === 429) {
        return res.status(429).json({
          success: false,
          message: "You're being rate-limited by the API. Please try again later.",
        });
      }

      throw err;
    }

    const results = { games, anime, manga };

    searchCache.set(cacheKey, results, "search-results");

    res.json({ success: true, results });
  } catch (err) {
    await Utility.error_logger("Game/Anime/Manga Search error:", err?.response?.data || err.message);

    res.status(500).json({ success: false, message: "Searching failed." });
  }
});

module.exports = search;
