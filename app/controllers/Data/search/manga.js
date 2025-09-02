const axios = require("axios");
const https = require("https");

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const httpsAgent = new https.Agent({ family: 4 });

const search_manga = async (searchQuery) => {
  await delay(150);

  const response = await axios.get(`https://api.jikan.moe/v4/manga`, {
    params: {
      q: searchQuery,
      limit: 5,
    },
    httpsAgent,
  });

  const mangaList = response.data.data || [];

  return mangaList.map((manga) => ({
    id: manga.mal_id,
    name: manga.title,
    thumbnail: manga.images?.jpg?.image_url || null,
    year: manga.published?.from ? new Date(manga.published.from).getFullYear() : "N/A",
    nsfw: manga.nsfw === "black" || manga.genres?.some(g => g.name === "Hentai") || manga.themes?.some(t => t.name === "Hentai")
  }));
};

module.exports = search_manga;
