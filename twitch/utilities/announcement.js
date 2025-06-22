const axios = require('axios');
const env = require('@global/utilities/env');

async function announcementUtility(message, color = 'primary') {
  try {
    const response = await axios.post(
      'https://api.twitch.tv/helix/chat/announcements',
      {
        broadcaster_id: env.twitch.channel.id,
        moderator_id: env.twitch.bot.id,
        message: message,
        color: color // 'blue' | 'green' | 'orange' | 'purple' | 'primary'
      },
      {
        headers: {
          Authorization: `Bearer ${env.twitch.bot.accessToken}`,
          'Client-Id': env.twitch.bot.clientId,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ Announcement sent:', response.status);
  } catch (error) {
    console.error('❌ Failed to send announcement:', error.response?.data || error.message);
  }
}


module.exports = announcementUtility;