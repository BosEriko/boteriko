const verify_id = async (appid) => {
  if (!appid) return false;

  try {
    const res = await fetch(`https://store.steampowered.com/api/appdetails?appids=${appid}`);

    const data = await res.json();

    return data?.[appid]?.success === true;
  } catch (error) {
    console.error('Failed to verify Steam App ID:', error);
    return false;
  }
};

module.exports = verify_id;
