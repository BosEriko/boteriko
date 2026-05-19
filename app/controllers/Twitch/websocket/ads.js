const { broadcastToClient } = require('@global/utilities/websocket');
const channelName = Config.twitch.channel.username;

let adRunning = false;
let adTimeout = null;

async function ads(client, payload) {
  try {
    const eventType = payload?.type || payload?.event_type || payload?.event?.type;

    if (eventType === 'channel.ad_start' || eventType === 'ad_start') {
      adRunning = true;

      const duration = payload?.duration || payload?.event?.duration || null;

      broadcastToClient({ type: 'AD_START', duration });
      client.say(channelName, `📺 Running an ad now!`);

      if (adTimeout) clearTimeout(adTimeout);

      if (duration) {
        adTimeout = setTimeout(() => {
          adRunning = false;
          broadcastToClient({ type: 'AD_END'});
          client.say(channelName, "✅ The ad has ended!");
        }, duration * 1000);
      }
    }

    if (eventType === 'channel.ad_end' || eventType === 'ad_end') {
      adRunning = false;

      if (adTimeout) clearTimeout(adTimeout);

      broadcastToClient({ type: 'AD_END' });
      client.say(channelName, "✅ The ad has ended!");
    }
  } catch (err) {
    await Utility.error_logger('Error handling ads:', err);
  }
};

module.exports = ads;
