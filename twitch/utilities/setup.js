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

  const url = `https://api.twitch.tv/helix/channels?broadcaster_id=${env.twitch.channel.id}`;

  try {
    await axios.patch(
      url,
      { title },
      {
        headers: {
          'Client-ID': env.twitch.bot.clientId,
          'Authorization': `Bearer ${env.twitch.bot.accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log("✅ Stream title updated successfully.");
    client.say(`#${env.twitch.channel.username}`, title);
  } catch (error) {
    if (error.response) {
      console.error("❌ Failed to update title:", error.response.data);
    } else {
      console.error("❌ Error occurred:", error.message);
    }
  }
}

module.exports = handleSetupUtility;
