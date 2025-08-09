const axios = require('axios');
const state = require('@global/utilities/state');

const channelName = `#${Config.twitch.channel.username}`;
const AD_DURATION = 90;
const maxAds = (parseInt(Config.stream.duration, 10) - 1) * 2;

async function handleAdUtility(client) {
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
}

async function runAd() {
  try {
    const { clientId, accessToken, id: broadcasterId } = Config.twitch.channel;

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
    await Utility.error_logger('❌ Failed to start Twitch ad', err);
    return false;
  }
}

module.exports = { handleAdUtility, runAd };
