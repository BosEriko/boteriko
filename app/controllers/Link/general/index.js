const general = (id) => {
  switch (id) {
    case "discord": return "💬 Join my Discord community here: http://discord.boseriko.com";
    case "facebook": return "📘 Follow me on Facebook: http://facebook.boseriko.com";
    case "instagram": return "📸 Follow me on Instagram: http://instagram.boseriko.com";
    case "plus": return "➕ Visit Boseriko Plus: https://plus.boseriko.com";
    case "queue": return "🎵 Check out the queue here: https://plus.boseriko.com/widget/music_queue";
    case "steam": return "🎮 Add me on Steam: http://steam.boseriko.com (180065630)";
    case "tiktok": return "🎶 Follow me on TikTok: http://tiktok.boseriko.com";
    case "twitch": return "🎥 Watch me live on Twitch: https://twitch.boseriko.com";
    case "x": return "🐦 Follow me on X (Twitter): http://x.boseriko.com";
    case "youtube": return "▶️ Subscribe on YouTube: http://youtube.boseriko.com";
    default: return "❓ Unknown link.";
  }
};

module.exports = general;
