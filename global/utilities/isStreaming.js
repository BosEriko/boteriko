const axios = require('axios');

async function isStreamingUtility(channelName, clientId, accessToken) {
  try {
      const url = `https://api.twitch.tv/helix/streams?user_login=${channelName}`;
      const response = await axios.get(url, {
          headers: {
              'Client-ID': clientId,
              'Authorization': `Bearer ${accessToken}`
          }
      });

      return response.data.data.length > 0;
  } catch (error) {
      console.error("Error fetching streamer status:", error);
      return false;
  }
}

module.exports = isStreamingUtility;
