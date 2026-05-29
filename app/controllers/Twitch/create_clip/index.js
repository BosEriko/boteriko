// DOCS: https://dev.twitch.tv/docs/api/reference#create-clip
const axios = require('axios');
const sendToDiscordUtility = require('@twitch/utilities/sendToDiscord');

const create_clip = async (user) => {
  try {
    const response = await axios.post(
      `https://api.twitch.tv/helix/clips?broadcaster_id=${Config.twitch.channel.id}`, null,
      {
        headers: {
          "Authorization": `Bearer ${Config.twitch.channel.accessToken}`,
          "Client-ID": Config.twitch.channel.clientId,
        },
      }
    );

    const clip = response.data.data?.[0];

    if (!clip) return '❌ Failed to create clip:';
    const clipUrl = `https://www.twitch.tv/${Config.twitch.channel.username}/clip/${clip.id}`;

    await sendToDiscordUtility(user, `🎬 ${clipUrl}`, Config.discord.webhook.clip);
    return `🎬 New Clip Created! ${clipUrl}`;
  } catch (err) {
    await Utility.error_logger(`❌ Failed to create clip:`, err.message);
  }
}

module.exports = create_clip;
