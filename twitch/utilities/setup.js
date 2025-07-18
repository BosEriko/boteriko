const axios = require('axios');
const env = require('@global/utilities/env');
const scheduleConstant = require('@twitch/constants/schedule');
const handleErrorUtility = require('@global/utilities/error');
const getLastTypingWinner = require('@twitch/utilities/typingWinner');

let lastCheckedDate = null;

function isNewDay() {
  const today = new Date().toISOString().split('T')[0];
  if (lastCheckedDate !== today) {
    lastCheckedDate = today;
    return true;
  }
  return false;
}

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
    await handleErrorUtility(`❌ Failed to fetch category ID for "${name}":`, err.response?.data || err.message);
    return null;
  }
}

async function handleSetupUtility(client) {
  if (!isNewDay()) return;

  const now = new Date();
  const dayOfWeek = now.toLocaleDateString('en-US', { weekday: 'long' });

  const schedule = scheduleConstant[dayOfWeek];
  if (!schedule) {
    await handleErrorUtility(`❌ No schedule found for ${dayOfWeek}`);
    return;
  }

  const { title, category } = schedule;
  const gameId = await getCategoryIdByName(category);

  const winnerData = await getLastTypingWinner();
  const winnerSuffix = winnerData ? ` | Typing Winner: @${winnerData.winner}` : '';
  const finalTitle = `${title}${winnerSuffix}`;

  const url = `https://api.twitch.tv/helix/channels?broadcaster_id=${env.twitch.channel.id}`;
  const body = gameId ? { title: finalTitle, game_id: gameId } : { title: finalTitle };

  try {
    await axios.patch(url, body, {
      headers: {
        'Client-ID': env.twitch.channel.clientId,
        'Authorization': `Bearer ${env.twitch.channel.accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    console.log("✅ Stream title and category updated successfully.");
    client.say(`#${env.twitch.channel.username}`, `📝 New Title: "${finalTitle}" | 📺 Category: ${category}`);
  } catch (error) {
    if (error.response) {
      await handleErrorUtility("❌ Failed to update title/category:", error.response.data);
    } else {
      await handleErrorUtility("❌ Error occurred:", error.message);
    }
  }
}

module.exports = handleSetupUtility;
