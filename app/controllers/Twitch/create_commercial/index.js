// DOCS: https://dev.twitch.tv/docs/api/reference#start-commercial
const axios = require('axios');
const { state } = require('@global/utilities/state');

const create_commercial = async () => {
  if (!state.isStreaming) {
    return "❌ Failed to start commercial. Stream is offline.";
  }

  try {
    const response = await axios.post(
      'https://api.twitch.tv/helix/channels/commercial',
      { broadcaster_id: Config.twitch.channel.id, length: 90 },
      {
        headers: {
          "Authorization": `Bearer ${Config.twitch.channel.accessToken}`,
          "Client-ID": Config.twitch.channel.clientId,
          "Content-Type": "application/json",
        },
      }
    );

    const commercial = response.data.data?.[0];

    if (!commercial) {
      return '❌ Failed to start commercial.';
    }

    const message = commercial.message || `📺 ${commercial.length}s commercial started!`;
    const retryAfter = commercial.retry_after;
    return `${message} Next commercial available in ${retryAfter}s.`;
  } catch (err) {
    await Utility.error_logger(`❌ Failed to start commercial:`, err.message);

    if (err.response?.data?.message) {
      return `❌ ${err.response.data.message}`;
    }

    return '❌ Failed to start commercial.';
  }
}

module.exports = create_commercial;
