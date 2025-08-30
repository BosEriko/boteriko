const axios = require("axios");

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const search_anime = async (searchQuery) => {
  await delay(150);

  const response = await axios.get(`https://api.jikan.moe/v4/anime`, {
    params: {
      q: searchQuery,
      limit: 5,
    },
  });

  const animeList = response.data.data || [];

  return animeList.map((anime) => ({
    id: anime.mal_id,
    name: anime.title,
    thumbnail: anime.images?.jpg?.small_image_url || anime.images?.jpg?.image_url || null,
    year: anime.aired?.from ? new Date(anime.aired.from).getFullYear() : "N/A"
  }));
};

module.exports = search_anime;
