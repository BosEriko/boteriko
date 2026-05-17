const get_game = async () => {
  const steamId = "76561198140331358";
  const res = await fetch(`https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key=${Config.steam.apiKey}&steamids=${steamId}`);

  const data = await res.json();
  const player = data.response.players[0];

  const currentGame = player.gameextrainfo ?? null;

  return currentGame;
};

module.exports = get_game;
