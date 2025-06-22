const axios = require('axios');

let recentTimestamps = [];

function canSendDiscordMessage() {
  const now = Date.now();
  recentTimestamps = recentTimestamps.filter(ts => now - ts < 1000);
  if (recentTimestamps.length < 2) {
    recentTimestamps.push(now);
    return true;
  }
  return false;
}

async function sendToDiscordUtility(user, message, webhookUrl) {
  if (!canSendDiscordMessage()) {
    console.warn('Too many Discord messages — dropping one.');
    return;
  }

  try {
    await axios.post(webhookUrl, {
      username: user.display_name || user.login,
      content: message,
      avatar_url: user.profile_image_url,
    });
  } catch (error) {
    console.error('Failed to send message to Discord:', error.message);
  }
}

module.exports = sendToDiscordUtility;
