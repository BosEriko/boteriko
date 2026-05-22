const get_id = async (game) => {
  const searchRes = await fetch(`https://steamcommunity.com/actions/SearchApps/${encodeURIComponent(game)}`);

  const searchData = await searchRes.json();

  if (!searchData || searchData.length === 0) {
    return null;
  }

  return searchData[0].appid;
};

module.exports = get_id;
