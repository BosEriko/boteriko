const axios = require('axios');

const update_channel_request = async (reward, id, status) => {
  try {
    await axios.patch(
      `https://api.twitch.tv/helix/channel_points/custom_rewards/redemptions`,
      { status },
      {
        params: {
          broadcaster_id: Config.twitch.channel.id,
          reward_id: reward.id,
          id: id,
        },
        headers: {
          "Client-ID": Config.twitch.channel.clientId,
          "Authorization": `Bearer ${Config.twitch.channel.accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    return `💸 Refunded ${reward.title} redemption (${id})`;
  } catch (err) {
    await Utility.error_logger('⚠️ Failed to refund redemption:', err.response?.data || err.message);
  }
};

module.exports = update_channel_request;
