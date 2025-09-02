const express = require('express');
const verify_firebase_token = require("../../concerns/verify_firebase_token");

const update_list = express.Router();

update_list.post('/', async (req, res) => {
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

    const { gameId, status } = req.body;

    if (!gameId) {
      return res.status(400).json({ success: false, message: "Game ID is required" });
    }

    const updateData = {};
    if (status !== undefined) updateData.status = status;

    const gameProfile = await Model.GameProfile.find(gameId);
    if (gameProfile) {
      if (gameProfile.attributes?.displayPicture) {
        updateData.displayPicture = gameProfile.attributes.displayPicture;
      }
      if (gameProfile.attributes?.name) {
        updateData.name = gameProfile.attributes.name;
      }
    }

    const updatedGameList = await Model.GameList.update_game_list(updateData, gameId, uid);

    return res.json({
      success: true,
      message: "Game list updated successfully.",
      gameList: updatedGameList
    });

  } catch (err) {
    console.error("Update Game List error:", err?.response?.data || err.message);
    await Utility.error_logger("Update Game List error:", err?.response?.data || err.message);
    res.status(500).json({ success: false, message: "Updating of Game List failed." });
  }
});

module.exports = update_list;
