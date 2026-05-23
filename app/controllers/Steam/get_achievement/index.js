const get_achievement = async (id) => {
  const [schemaRes, playerRes] = await Promise.all([
    fetch(`https://api.steampowered.com/ISteamUserStats/GetSchemaForGame/v2/?key=${Config.steam.apiKey}&appid=${id}`),
    fetch(`https://api.steampowered.com/ISteamUserStats/GetPlayerAchievements/v1/?key=${Config.steam.apiKey}&steamid=${Config.steam.profile.id}&appid=${id}`),
  ]);

  const schemaJson = await schemaRes.json();
  const playerJson = await playerRes.json();

  const achievements = schemaJson?.game?.availableGameStats?.achievements ?? [];

  if (achievements.length === 0) {
    return 0;
  }

  const playerAchievements = playerJson?.playerstats?.achievements ?? [];
  const unlocked = playerAchievements.filter((achievement) => achievement.achieved === 1).length;

  return Math.round((unlocked / achievements.length) * 100);
};

module.exports = get_achievement;
