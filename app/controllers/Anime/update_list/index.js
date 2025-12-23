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

    const { animeId, status } = req.body;

    if (!animeId) {
      return res.status(400).json({ success: false, message: "Anime ID is required" });
    }

    const updateData = {};
    if (status !== undefined) updateData.status = status;

    const animeProfile = await Model.AnimeProfile.find(animeId);
    if (animeProfile) {
      if (animeProfile.attributes?.displayPicture) {
        updateData.displayPicture = animeProfile.attributes.displayPicture;
      }
      if (animeProfile.attributes?.name) {
        updateData.name = animeProfile.attributes.name;
      }
    }

    const updatedAnimeList = await Model.AnimeList.update_anime_list(updateData, animeId, uid);

    return res.json({
      success: true,
      message: "Anime list updated successfully.",
      animeList: updatedAnimeList
    });

  } catch (err) {
    console.error("Update Anime List error:", err?.response?.data || err.message);
    await Utility.error_logger("Update Anime List error:", err?.response?.data || err.message);
    res.status(500).json({ success: false, message: "Updating of Anime List failed." });
  }
});

module.exports = update_list;
