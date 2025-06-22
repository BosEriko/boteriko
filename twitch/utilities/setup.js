const axios = require('axios');
const llmUtility = require('@global/utilities/llm');
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

  let title = "Stream Title";
  let day = new Date().toLocaleDateString('en-US', { weekday: 'long' });

  try {
    title = (await llmUtility(
      env.openrouter.apiKey,
      'You are a friendly and funny title maker for a Twitch Channel. Your job is to make Twitch Channels.',
      `Can you make me a title about the day? Which is currently ${day}. Make it a pick up line. Reply with the title only. Please don't add variables to it like [Your Username].`
    )).replace(/^["']|["']$/g, '');
  } catch (err) {
    console.error('❌ OpenRouter Error:', err?.response?.data || err.message);
  }

  const gameId = await getCategoryIdByName("Just Chatting");

  const url = `https://api.twitch.tv/helix/channels?broadcaster_id=${env.twitch.channel.id}`;
  const body = gameId ? { title, game_id: gameId } : { title };

  try {
    await axios.patch(
      url,
      body,
      {
        headers: {
          'Client-ID': env.twitch.bot.clientId,
          'Authorization': `Bearer ${env.twitch.bot.accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log("✅ Stream title and category updated successfully.");
    client.say(`#${env.twitch.channel.username}`, `📝 New Title: "${title}" | 📺 Category: Just Chatting`);
  } catch (error) {
    if (error.response) {
      console.error("❌ Failed to update title/category:", error.response.data);
    } else {
      console.error("❌ Error occurred:", error.message);
    }
  }
}

module.exports = handleSetupUtility;
