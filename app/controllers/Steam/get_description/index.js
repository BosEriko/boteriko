const get_description = async (id) => {
  const detailsRes = await fetch(`https://store.steampowered.com/api/appdetails?appids=${id}&l=en`);

  const detailsJson = await detailsRes.json();

  const data = detailsJson[id]?.data;

  if (!data || !data.short_description) {
    return null;
  }

  return data.short_description.split(".")[0].trim();
}

module.exports = get_description;
