const axios = require("axios");

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const search_manga = async (searchQuery) => {
  await delay(150);

  const response = await axios.get(`https://api.jikan.moe/v4/manga`, {
    params: {
      q: searchQuery,
      limit: 5,
    },
  });

  const mangaList = response.data.data || [];

  return mangaList.map((manga) => ({
    id: manga.mal_id,
    name: manga.title,
    thumbnail: manga.images?.jpg?.image_url || null,
    year: manga.published?.from ? new Date(manga.published.from).getFullYear() : "N/A"
  }));
};

module.exports = search_manga;
