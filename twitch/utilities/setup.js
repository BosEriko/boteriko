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

async function getHolidayName(today) {
  try {
    const [year, month, day] = today.split("-");
    const countries = ['US', 'PH', 'JP'];
    for (const country of countries) {
      const res = await axios.get(`https://date.nager.at/api/v3/PublicHolidays/${year}/${country}`);
      const match = res.data.find(holiday => holiday.date === today);
      if (match) {
        return match.name;
      }
    }

    return null;
  } catch (err) {
    console.error("❌ Failed to get holiday from API:", err.response?.data || err.message);
    return null;
  }
}

async function generateTitleFromHoliday(holidayName) {
  try {
    const response = await llmUtility(
      'You are a funny and clever Twitch title generator. Your job is to make short and catchy stream titles.',
      `Create a funny or flirty Twitch stream title or pick-up line inspired by ${holidayName}. Reply with the title only.`
    );

    return response.replace(/^["']|["']$/g, '').trim();
  } catch (err) {
    console.error("❌ Failed to generate title from holiday:", err.response?.data || err.message);
    return "Just Chatting Vibes 😎";
  }
}

async function generateTitleFromDayOfWeek(dayOfWeek) {
  try {
    const response = await llmUtility(
      'You are a funny and clever Twitch title generator. Your job is to make short and catchy stream titles.',
      `Create a Twitch stream title or pick-up line inspired by it being a ${dayOfWeek}. Make it casual or funny. Reply with the title only.`
    );

    return response.replace(/^["']|["']$/g, '').trim();
  } catch (err) {
    console.error("❌ Failed to generate title from day of week:", err.response?.data || err.message);
    return "Just Chatting Vibes 😎";
  }
}

async function handleSetupUtility(client) {
  if (!isNewDay()) return;

  const today = new Date();
  const isoDate = today.toISOString().split('T')[0];
  const dayOfWeek = today.toLocaleDateString('en-US', { weekday: 'long' });

  let title;
  const holidayName = await getHolidayName(isoDate);

  if (holidayName) {
    title = await generateTitleFromHoliday(holidayName);
  } else {
    title = await generateTitleFromDayOfWeek(dayOfWeek);
  }

  const gameId = await getCategoryIdByName("Just Chatting");

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
