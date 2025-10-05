const axios = require("axios");

const state = require('@global/utilities/state');
const title_generator = require("../../concerns/title_generator");

const update_title = async (title) => {
  try {
    const titleGenerator = title_generator(title);
    let newTitle = titleGenerator.title();

    if (state.winners.typing) {
      newTitle = titleGenerator.append("Previous Typing Winner", `@${state.winners.typing}`);
    }

    if (state.winners.firstChat) {
      newTitle = titleGenerator.append("First Chatter", `@${state.winners.firstChat}`);
    }

    await axios.patch(
      `https://api.twitch.tv/helix/channels?broadcaster_id=${Config.twitch.channel.id}`,
      { title: newTitle },
      {
        headers: {
          "Client-ID": Config.twitch.channel.clientId,
          "Authorization": `Bearer ${Config.twitch.channel.accessToken}`
        }
      }
    );

    return `✅ Twitch title updated to "${newTitle}"`;
  } catch (err) {
    await Utility.error_logger(`❌ Failed to update title to "${newTitle}":`, err.message);
  }
}

module.exports = update_title;