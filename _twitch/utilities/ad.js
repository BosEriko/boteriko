const cron = require('node-cron');
const axios = require('axios');
const env = require('@config/environments/base');
const state = require('@global/utilities/state');
const handleErrorUtility = require('@global/utilities/error');

const channelName = `#${env.twitch.channel.username}`;
const AD_DURATION = 90;
const maxAds = (parseInt(env.stream.duration, 10) - 1) * 2;

function handleAdUtility(client) {
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

    if (state.adCount >= maxAds) {
      console.log(`🛑 Reached ad limit for the stream session (${maxAds} ads).`);
      return;
    }

    const success = await runAd();
    if (success) {
      state.adCount++;
      client.say(channelName, `📺 Running an ad now!`);

      setTimeout(async () => {
        client.say(channelName, "✅ The ad has ended!");
      }, AD_DURATION * 1000);
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

module.exports = { handleAdUtility, runAd };
