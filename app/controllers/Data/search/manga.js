const axios = require("axios");

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const search_manga = async (searchQuery) => {
  await delay(150);

  const response = await axios.get(`https://api.jikan.moe/v4/manga`, {
    params: {
      q: searchQuery,
      limit: 10,
    },
  });

  return response.data.data || [];
};

module.exports = search_manga;
