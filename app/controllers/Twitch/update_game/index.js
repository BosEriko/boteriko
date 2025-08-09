const axios = require("axios");

const read_category_id_by_name = require("../read_category_id_by_name");

const update_game = async (gameName) => {
  try {
    const categoryId = await read_category_id_by_name(gameName);

    if (!categoryId) {
      const errorMessage = `❌ Could not find category for "${gameName}"`;
      await Utility.error_logger(errorMessage);
      return errorMessage;
    }

    await axios.patch(
      `https://api.twitch.tv/helix/channels?broadcaster_id=${Config.twitch.channel.id}`,
      { game_id: categoryId },
      {
        headers: {
          "Client-ID": Config.twitch.channel.clientId,
          "Authorization": `Bearer ${Config.twitch.channel.accessToken}`
        }
      }
    );

    return `✅ Twitch category updated to "${gameName}"`;
  } catch (err) {
    await Utility.error_logger(`❌ Failed to update category to "${gameName}":`, err.message);
  }
}

module.exports = update_game;