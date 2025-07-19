const cron = require('node-cron');
const axios = require('axios');
const env = require('@global/utilities/env');
const state = require('@global/utilities/state');
const handleErrorUtility = require('@global/utilities/error');
const { broadcastToClient } = require('@global/utilities/websocket');

const channelName = `#${env.twitch.channel.username}`;
const AD_DURATION = 90;

function handleAdUtility(client) {
  let lastAdTime = null;

  cron.schedule('*/30 * * * *', async () => {
    if (!state.isStreaming) {
      console.log('⏩ Skipping ad — not currently streaming.');
      return;
    }

    if (!state.hasSkippedFirstAd) {
      console.log('⏩ Skipping first ad after startup.');
      state.hasSkippedFirstAd = true;
      return;
    }

    const success = await runAd();
    if (success) {
      broadcastToClient({ type: 'TICKER', message: "Ad Break", isVisible: true });
      client.say(channelName, `📺 Running an ad now! (${AD_DURATION}s)`);
      client.say(channelName, "💡 Time for a quick break! Remember to stretch, blink, and refill your water 💧");
      lastAdTime = Date.now();

      setTimeout(() => {
        broadcastToClient({ type: 'TICKER', message: null, isVisible: false });
        client.say(channelName, `✅ The ad has ended!`);
      }, AD_DURATION * 1000);
    }
  });

  cron.schedule('*/5 * * * *', () => {
    if (!state.isStreaming || !lastAdTime) return;

    const now = Date.now();
    const diff = now - lastAdTime;
    const five = 5 * 60 * 1000;
    const twentyFive = 25 * 60 * 1000;

    if (diff >= twentyFive && diff < twentyFive + five) {
      client.say(channelName, '📢 Ad in 5 minutes!');
    }
  });
}

async function runAd() {
  try {
    const { clientId, accessToken, id: broadcasterId } = env.twitch.channel;

    const response = await axios.post(
      'https://api.twitch.tv/helix/channels/commercial',
      {
        broadcaster_id: broadcasterId,
        length: AD_DURATION
      },
      {
        headers: {
          'Client-ID': clientId,
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('📺 Ad started:', response.data);
    return true;
  } catch (err) {
    await handleErrorUtility('❌ Failed to start Twitch ad', err);
    return false;
  }
}

module.exports = handleAdUtility;
