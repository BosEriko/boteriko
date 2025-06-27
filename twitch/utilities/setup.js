const axios = require('axios');
const env = require('@global/utilities/env');

let lastCheckedDate = null;

function isNewDay() {
  const today = new Date().toISOString().split('T')[0];
  if (lastCheckedDate !== today) {
    lastCheckedDate = today;
    return true;
  }
  return false;
}

const dailySchedule = {
  Monday: { title: "Minecraft Monday 🌍⛏️", category: "Minecraft" },
  Tuesday: { title: "Try-it Tuesday 🎮🆕", category: "Games + Demos" },
  Wednesday: { title: "Waifu Wednesday ⚔️🍀", category: "Zenless Zone Zero" },
  Thursday: { title: "Techie Thursday 💻💾", category: "Software and Game Development" },
  Friday: { title: "Fortnite Friday 🔫💥", category: "Fortnite" },
  Saturday: { title: "Side Quest Saturday 💬🎯", category: "Just Chatting" },
  Sunday: { title: "Slow Down Sunday 💻🎮", category: "Just Chatting" },
};

async function getCategoryIdByName(name) {
  try {
    const res = await axios.get('https://api.twitch.tv/helix/games', {
      params: { name },
      headers: {
        'Client-ID': env.twitch.bot.clientId,
        'Authorization': `Bearer ${env.twitch.bot.accessToken}`,
      },
    });

    return res.data.data?.[0]?.id || null;
  } catch (err) {
    console.error(`❌ Failed to fetch category ID for "${name}":`, err.response?.data || err.message);
    return null;
  }
}

async function handleSetupUtility(client) {
  if (!isNewDay()) return;

  const now = new Date();
  const dayOfWeek = now.toLocaleDateString('en-US', { weekday: 'long' });

  const schedule = dailySchedule[dayOfWeek];
  if (!schedule) {
    console.error(`❌ No schedule found for ${dayOfWeek}`);
    return;
  }

  const { title, category } = schedule;
  const gameId = await getCategoryIdByName(category);

  const url = `https://api.twitch.tv/helix/channels?broadcaster_id=${env.twitch.channel.id}`;
  const body = gameId ? { title, game_id: gameId } : { title };

  try {
    await axios.patch(url, body, {
      headers: {
        'Client-ID': env.twitch.bot.clientId,
        'Authorization': `Bearer ${env.twitch.bot.accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    console.log("✅ Stream title and category updated successfully.");
    client.say(`#${env.twitch.channel.username}`, `📝 New Title: "${title}" | 📺 Category: ${category}`);
  } catch (error) {
    if (error.response) {
      console.error("❌ Failed to update title/category:", error.response.data);
    } else {
      console.error("❌ Error occurred:", error.message);
    }
  }
}

module.exports = handleSetupUtility;
