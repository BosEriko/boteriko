const express = require('express');
const verify_firebase_token = require("../../concerns/verify_firebase_token");

const disconnect = express.Router();

disconnect.post('/', async (req, res) => {
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

    const connection = await Model.Connection.find_or_upsert_by({
      discord: null,
    }, user.id);

    const data = {
      success: true,
      connection,
      user,
    }

    res.json(data);
  } catch (err) {
    await Utility.error_logger("TETR.IO Account Disconnection error:", err?.response?.data || err.message);
    res.status(500).json({ success: false, message: "Disconnection of TETR.IO Account failed." });
  }
});

module.exports = disconnect;
