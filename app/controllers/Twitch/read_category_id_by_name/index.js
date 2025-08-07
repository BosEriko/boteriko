const env = require("@config/environments/base");
const axios = require('axios');
const handleErrorUtility = require('@global/utilities/error');

const read_category_id_by_name = async (name) => {
  try {
    const res = await axios.get('https://api.twitch.tv/helix/games', {
      params: { name },
      headers: {
        'Client-ID': env.twitch.bot.clientId,
        'Authorization': `Bearer ${env.twitch.bot.accessToken}`,
      },
    });

    return res.data.data?.[0]?.id || null;
  } catch (err) {
    await handleErrorUtility(`❌ Failed to fetch category ID for "${name}":`, err.response?.data || err.message);
    return null;
  }
}

module.exports = read_category_id_by_name;