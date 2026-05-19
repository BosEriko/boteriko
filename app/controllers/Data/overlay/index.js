const overlay = (req, res) => {
  return res.json({
    start: Config.stream.start,
    duration: Config.stream.duration,
    days: Config.stream.days
  });
};

module.exports = overlay;
