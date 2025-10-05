const axios = require("axios");

const update_title = async (title) => {
  try {
    await axios.patch(
      `https://api.twitch.tv/helix/channels?broadcaster_id=${Config.twitch.channel.id}`,
      { title: title },
      {
        headers: {
          "Client-ID": Config.twitch.channel.clientId,
          "Authorization": `Bearer ${Config.twitch.channel.accessToken}`
        }
      }
    );

    return `✅ Twitch title updated to "${title}"`;
  } catch (err) {
    await Utility.error_logger(`❌ Failed to update title to "${title}":`, err.message);
  }
}

module.exports = update_title;