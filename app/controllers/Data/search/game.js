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
    `fields name, slug, cover.url, first_release_date, summary, parent_game;
     where name ~ *"${searchQuery}"* & parent_game = null;
     sort first_release_date desc;
     limit 10;`,
    {
      headers: {
        "Client-ID": clientId,
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
      },
    }
  );

  return igdbResponse.data || [];
};

module.exports = search_games;
