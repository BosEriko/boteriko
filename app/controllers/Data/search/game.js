const axios = require("axios");

const search_games = async (searchQuery) => {
  const clientId = Config.twitch.app.clientId;
  const clientSecret = Config.twitch.app.clientSecret;

  const tokenResponse = await axios.post(
    `https://id.twitch.tv/oauth2/token`,
    null,
    {
      params: {
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: "client_credentials",
      },
    }
  );

  const accessToken = tokenResponse.data.access_token;

  const igdbResponse = await axios.post(
    `https://api.igdb.com/v4/games`,
    `fields name, cover.url, first_release_date, parent_game;
     where name ~ *"${searchQuery}"* & parent_game = null;
     sort first_release_date desc;
     limit 5;`,
    {
      headers: {
        "Client-ID": clientId,
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
      },
    }
  );

  const games = igdbResponse.data || [];

  return games.map((game) => ({
    id: game.id,
    name: game.name,
    thumbnail: game.cover?.url ? game.cover.url.replace("t_thumb", "t_cover_big") : null,
    year: game.first_release_date ? new Date(game.first_release_date * 1000).getFullYear() : "N/A",
    nsfw: game.age_ratings?.some(r => [6, 11].includes(r.rating)) || false
  }));
};

module.exports = search_games;
