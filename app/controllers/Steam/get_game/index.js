const get_game = async () => {
  const res = await fetch(`https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key=${Config.steam.apiKey}&steamids=${Config.steam.profile.id}`);

  const data = await res.json();
  const player = data.response.players[0];

  const currentGame = player.gameextrainfo ?? null;
  const currentId = player.gameid ?? null;

  return { currentGame, currentId };
};

module.exports = get_game;
