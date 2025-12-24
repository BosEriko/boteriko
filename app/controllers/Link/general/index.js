const general = (id) => {
  switch (id) {
    case "discord": return "💬 Join my Discord community here: http://discord.boseriko.com";
    case "queue": return "🎵 Check out the queue here: https://plus.boseriko.com/widget/music_queue";
    case "steam": return "🎮 Add me on Steam: http://steam.boseriko.com (180065630)";
    default: return "❓ Unknown link.";
  }
};

module.exports = general;
