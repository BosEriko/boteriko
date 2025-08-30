const express = require('express');
const axios = require('axios');
const verify_firebase_token = require("../../concerns/verify_firebase_token");

const search = express.Router();

search.post('/', async (req, res) => {
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

    const searchQuery = req.query.search;
    if (!searchQuery || searchQuery.trim() === "") {
      return res.status(400).json({ success: false, message: "Search query is required." });
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
          grant_type: 'client_credentials'
        }
      }
    );

    const accessToken = tokenResponse.data.access_token;

    const igdbResponse = await axios.post(
      `https://api.igdb.com/v4/search`,
      `search "${searchQuery}"; fields name; limit 10;`,
      {
        headers: {
          "Client-ID": clientId,
          "Authorization": `Bearer ${accessToken}`,
          "Accept": "application/json"
        },
      }
    );

    res.json({
      success: true,
      count: igdbResponse.data.length,
      results: igdbResponse.data,
    });

  } catch (err) {
    await Utility.error_logger("Game Search error:", err?.response?.data || err.message);
    res.status(500).json({ success: false, message: "Searching of Game failed." });
  }
});

module.exports = search;
