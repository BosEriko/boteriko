const axios = require('axios');
const create_custom_reward = require("../create_custom_reward");

const create_custom_rewards = async () => {
  try {
    let existingRewards = [];

    try {
      const { data } = await axios.get(
        `https://api.twitch.tv/helix/channel_points/custom_rewards`,
        {
          params: {
            broadcaster_id: Config.twitch.channel.id,
          },
          headers: {
            "Client-ID": Config.twitch.channel.clientId,
            "Authorization": `Bearer ${Config.twitch.channel.accessToken}`,
          },
        }
      );

      existingRewards = data.data || [];
    } catch (err) {
      if (err.response?.status === 403) return;
      throw err;
    }

    for (const reward of Constant.CustomReward) {
      const exists = existingRewards.some(
        (existing) => existing.title.toLowerCase() === reward.title.toLowerCase()
      );

      if (exists) continue;

      const result = await create_custom_reward(reward);
      console.log(result);
    }

    return `✅ Finished processing rewards`;
  } catch (err) {
    await Utility.error_logger('⚠️ Failed to create custom rewards:', err.response?.data || err.message);
  }
};

module.exports = create_custom_rewards;