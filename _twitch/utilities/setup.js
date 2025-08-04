const Controller = require("@controller");

const axios = require('axios');
const env = require('@config/environments/base');
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
  const gameId = await Controller.Twitch.read_category_id_by_name(category);

  const winnerData = await getLastTypingWinner();
  const titleGenerator = Controller.Concern.TitleGenerator(title);
  let newTitle = titleGenerator.title();

  if (winnerData) {
    newTitle = titleGenerator.append("Previous Typing Winner", `@${winnerData.winner}`);
  }

  const url = `https://api.twitch.tv/helix/channels?broadcaster_id=${env.twitch.channel.id}`;
  const body = gameId ? { title: newTitle, game_id: gameId } : { title: newTitle };

  try {
    await axios.patch(url, body, {
      headers: {
        'Client-ID': env.twitch.channel.clientId,
        'Authorization': `Bearer ${env.twitch.channel.accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    console.log("✅ Stream title and category updated successfully.");
    client.say(`#${env.twitch.channel.username}`, `📝 New Title: "${newTitle}" | 📺 Category: ${category}`);
  } catch (error) {
    if (error.response) {
      await handleErrorUtility("❌ Failed to update title/category:", error.response.data);
    } else {
      await handleErrorUtility("❌ Error occurred:", error.message);
    }
  }
}

module.exports = handleSetupUtility;
