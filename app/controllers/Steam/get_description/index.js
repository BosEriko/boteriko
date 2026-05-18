const get_description = async (title, charLimit = 100) => {
  const searchRes = await fetch(`https://steamcommunity.com/actions/SearchApps/${encodeURIComponent(title)}`);

  const searchData = await searchRes.json();

  if (!searchData || searchData.length === 0) {
    return null;
  }

  const appid = searchData[0].appid;

  const detailsRes = await fetch(`https://store.steampowered.com/api/appdetails?appids=${appid}&l=en`);

  const detailsJson = await detailsRes.json();

  const data = detailsJson[appid]?.data;

  if (!data || !data.short_description) {
    return null;
  }

  let description = data.short_description.split(".")[0].trim();

  if (description.length > charLimit) {
    description = description.slice(0, charLimit - 3).trim() + "...";
  }

  return description;
}

module.exports = get_description;
