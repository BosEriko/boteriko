const axios = require('axios');

const create_custom_reward = async (parameters) => {
  try {
    const response = await axios.post(
      `https://api.twitch.tv/helix/channel_points/custom_rewards`,
      parameters,
      {
        params: {
          broadcaster_id: Config.twitch.channel.id,
        },
        headers: {
          "Client-ID": Config.twitch.channel.clientId,
          "Authorization": `Bearer ${Config.twitch.channel.accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    const reward = response.data.data[0];
    return `✅ Reward "${reward.title}" created successfully`;
  } catch (err) {
    await Utility.error_logger('⚠️ Failed to create custom reward:', err.response?.data || err.message);
  }
};

module.exports = create_custom_reward;
