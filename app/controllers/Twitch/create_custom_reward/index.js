const axios = require('axios');
const FormData = require('form-data');

const create_custom_reward = async (parameters) => {
  try {
    const { icon, ...validParams } = parameters;

    const response = await axios.post(
      `https://api.twitch.tv/helix/channel_points/custom_rewards`,
      validParams,
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

    if (icon) {
      const fetchImageBuffer = async (url) => {
        const imgResponse = await axios.get(url, { responseType: 'arraybuffer' });
        return Buffer.from(imgResponse.data, 'binary');
      };

      const uploadIcon = async (imageBuffer, scale) => {
        const form = new FormData();
        form.append('image', imageBuffer, {
          filename: `icon@${scale}x.png`,
          contentType: 'image/png',
        });

        await axios.post(
          `https://api.twitch.tv/helix/channel_points/custom_rewards/update_image`,
          form,
          {
            params: {
              broadcaster_id: Config.twitch.channel.id,
              reward_id: reward.id,
              image_scale: scale,
            },
            headers: {
              ...form.getHeaders(),
              "Client-ID": Config.twitch.channel.clientId,
              "Authorization": `Bearer ${Config.twitch.channel.accessToken}`,
            },
          }
        );
      };

      await uploadIcon(await fetchImageBuffer(icon.size_28), '1');
      await uploadIcon(await fetchImageBuffer(icon.size_56), '2');
      await uploadIcon(await fetchImageBuffer(icon.size_112), '4');
    }

    return `✅ Reward "${reward.title}" created successfully with icons.`;
  } catch (err) {
    await Utility.error_logger('⚠️ Failed to create custom reward:', err.response?.data || err.message);
  }
};

module.exports = create_custom_reward;
