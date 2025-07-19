const cron = require('node-cron');
const axios = require('axios');
const env = require('@global/utilities/env');
const state = require('@global/utilities/state');
const handleErrorUtility = require('@global/utilities/error');

const channelName = `#${env.twitch.channel.username}`;

function handleAdUtility(client) {
  let lastAdTime = null;

  cron.schedule('*/30 * * * *', async () => {
    if (!state.isStreaming) {
      console.log('⏩ Skipping ad — not currently streaming.');
      return;
    }

    const now = Date.now();
    const streamStartTime = new Date(env.stream.start).getTime();
    const thirtyMinutes = 30 * 60 * 1000;

    if (now - streamStartTime < thirtyMinutes) {
      console.log('⏩ Skipping ad — within first 30 minutes of stream.');
      return;
    }

    const success = await runAd();
    if (success) {
      client.say(channelName, `📺 Running an ad now!`);
      lastAdTime = now;
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
        length: 90
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
