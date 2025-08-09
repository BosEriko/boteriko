const axios = require('axios');

async function handleAnnouncementUtility(message, color = 'primary') {
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
  } catch (error) {
    await Utility.error_logger('❌ Failed to send announcement:', error.response?.data || error.message);
  }
}

module.exports = handleAnnouncementUtility;