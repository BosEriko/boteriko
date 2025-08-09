const axios = require('axios');

async function handleAnnouncementUtility(message, color = 'primary') {
  try {
    const response = await axios.post(
      'https://api.twitch.tv/helix/chat/announcements',
      {
        broadcaster_id: Config.twitch.channel.id,
        moderator_id: Config.twitch.bot.id,
        message: message,
        color: color // 'blue' | 'green' | 'orange' | 'purple' | 'primary'
      },
      {
        headers: {
          Authorization: `Bearer ${Config.twitch.bot.accessToken}`,
          'Client-Id': Config.twitch.bot.clientId,
          'Content-Type': 'application/json'
        }
      }
    );
  } catch (error) {
    await Utility.error_logger('❌ Failed to send announcement:', error.response?.data || error.message);
  }
}

module.exports = handleAnnouncementUtility;