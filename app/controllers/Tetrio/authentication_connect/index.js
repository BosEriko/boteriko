const express = require("express");

const axios = require("axios");
const verify_firebase_token = require("../../concerns/verify_firebase_token");

const authentication_connect = express.Router();

authentication_connect.post("/", async (req, res) => {
  try {
    const { username } = req.body;
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const token = await verify_firebase_token(authHeader.split(" ")[1]);
    const uid = token.uid;

    const tetrioRes = await axios.get(`https://ch.tetr.io/api/users/${username}`, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36",
        "Accept": "application/json",
      },
    });
    const tetrioData = tetrioRes.data;

    if (!tetrioData.success) {
      return res.status(400).json({ success: false, message: "Failed to fetch TETR.IO user data." });
    }

    const user = tetrioData.data;

    const twitchConnection = user.connections?.twitch;
    if (!twitchConnection || !twitchConnection.id) {
      return res.status(400).json({
        success: false,
        message: "No Twitch is associated to this account, please connect your TETR.IO account to your Twitch account first."
      });
    }

    if (twitchConnection.id !== uid) {
      return res.status(400).json({
        success: false,
        message: "The Twitch associated with this account does not match the Twitch associated with your BosEriko+ account."
      });
    }

    await Model.Connection.find_or_upsert_by({
      tetrio: user._id,
    }, uid);

    return res.json({
      success: true,
      message: "TETR.IO account connected!"
    });

  } catch (err) {
    await Utility.error_logger('TETR.IO Connection error:', err.response?.data || err.message);
    res.status(500).json({ success: false, message: "TETR.IO connection failed." });
  }
});

module.exports = authentication_connect;
