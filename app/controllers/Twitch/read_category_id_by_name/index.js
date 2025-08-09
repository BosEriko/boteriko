const axios = require('axios');

const read_category_id_by_name = async (query) => {
  try {
    const res = await axios.get('https://api.twitch.tv/helix/search/categories', {
      params: { query },
      headers: {
        'Client-ID': Config.twitch.bot.clientId,
        'Authorization': `Bearer ${Config.twitch.bot.accessToken}`,
      },
    });

    const results = res.data.data || [];
    if (results.length === 0) return null;

    const exactMatch = results.find(
      cat => cat.name.toLowerCase() === query.toLowerCase()
    );

    return (exactMatch || results[0]).id;
  } catch (err) {
    await Utility.error_logger(`❌ Failed to fetch category ID for "${query}":`, err.response?.data || err.message);
    return null;
  }
}

module.exports = read_category_id_by_name;