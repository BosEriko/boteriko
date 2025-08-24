const platform_router = ({ twitch, discord }) => {
  const map = {
    T: twitch,
    TWITCH: twitch,
    D: discord,
    DISCORD: discord,
  };

  return new Proxy({}, {
    get(_, key) {
      return map[String(key).toUpperCase()];
    }
  });
};

module.exports = platform_router;