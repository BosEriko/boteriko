const axios = require('axios');
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

  const schedule = Constant.Schedule[dayOfWeek];
  if (!schedule) {
    await Utility.error_logger(`❌ No schedule found for ${dayOfWeek}`);
    return;
  }

  const { title, category } = schedule;
  const gameId = await Controller.Twitch.read_category_id_by_name(category);

  const winnerData = await getLastTypingWinner();
  const titleGenerator = Controller.Concern.title_generator(title);
  let newTitle = titleGenerator.title();

  if (winnerData) {
    newTitle = titleGenerator.append("Previous Typing Winner", `@${winnerData.winner}`);
  }

  const url = `https://api.twitch.tv/helix/channels?broadcaster_id=${Config.twitch.channel.id}`;
  const body = gameId ? { title: newTitle, game_id: gameId } : { title: newTitle };

  try {
    await axios.patch(url, body, {
      headers: {
        'Client-ID': Config.twitch.channel.clientId,
        'Authorization': `Bearer ${Config.twitch.channel.accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    console.log("✅ Stream title and category updated successfully.");
    client.say(`#${Config.twitch.channel.username}`, `📝 New Title: "${newTitle}" | 📺 Category: ${category}`);
  } catch (error) {
    if (error.response) {
      await Utility.error_logger("❌ Failed to update title/category:", error.response.data);
    } else {
      await Utility.error_logger("❌ Error occurred:", error.message);
    }
  }
}

module.exports = handleSetupUtility;
