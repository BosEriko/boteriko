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

    const { mangaId, status } = req.body;

    if (!mangaId) {
      return res.status(400).json({ success: false, message: "Manga ID is required" });
    }

    const updateData = {};
    if (status !== undefined) updateData.status = status;

    const mangaProfile = await Model.MangaProfile.find(mangaId);
    if (mangaProfile) {
      if (mangaProfile.attributes?.displayPicture) {
        updateData.displayPicture = mangaProfile.attributes.displayPicture;
      }
      if (mangaProfile.attributes?.name) {
        updateData.name = mangaProfile.attributes.name;
      }
    }

    const updatedMangaList = await Model.MangaList.update_manga_list(updateData, mangaId, uid);

    return res.json({
      success: true,
      message: "Manga list updated successfully.",
      mangaList: updatedMangaList
    });

  } catch (err) {
    console.error("Update Manga List error:", err?.response?.data || err.message);
    await Utility.error_logger("Update Manga List error:", err?.response?.data || err.message);
    res.status(500).json({ success: false, message: "Updating of Manga List failed." });
  }
});

module.exports = update_list;
