const env = require("@config/environments/base");
const axios = require('axios');
const handleErrorUtility = require('@global/utilities/error');

const delete_channel_request = async (reward, id) => {
  try {
    await axios.patch(
      `https://api.twitch.tv/helix/channel_points/custom_rewards/redemptions`,
      { status: "CANCELED" },
      {
        params: {
          broadcaster_id: env.twitch.channel.id,
          reward_id: reward.id,
          id: id,
        },
        headers: {
          "Client-ID": env.twitch.channel.clientId,
          "Authorization": `Bearer ${env.twitch.channel.accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    return `💸 Refunded ${reward.title} redemption (${id})`;
  } catch (err) {
    await handleErrorUtility('⚠️ Failed to refund redemption:', err.response?.data || err.message);
  }
};

module.exports = delete_channel_request;
