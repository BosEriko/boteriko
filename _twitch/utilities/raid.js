const axios = require('axios');
const { broadcastToClient } = require('@global/utilities/websocket');
const state = require('@global/utilities/state');

const channelName = `#${env.twitch.channel.username}`;

async function getUserId(username) {
  try {
    const response = await axios.get(
      `https://api.twitch.tv/helix/users?login=${username}`,
      {
        headers: {
          Authorization: `Bearer ${env.twitch.channel.accessToken}`,
          'Client-Id': env.twitch.channel.clientId
        }
      }
    );

    return response.data.data[0]?.id;
  } catch (err) {
    await Utility.error_logger('Failed to fetch user ID:', err.response?.data || err.message);
    return null;
  }
}

async function triggerRaid(toChannelId) {
  try {
    const response = await axios.post(
      `https://api.twitch.tv/helix/raids?from_broadcaster_id=${env.twitch.channel.id}&to_broadcaster_id=${toChannelId}`,
      null,
      {
        headers: {
          Authorization: `Bearer ${env.twitch.channel.accessToken}`,
          'Client-Id': env.twitch.channel.clientId
        }
      }
    );

    return response.data;
  } catch (err) {
    await Utility.error_logger('Failed to start raid:', err.response?.data || err.message);
    throw new Error('Unable to start raid');
  }
}

async function handleRaidUtility(client, user, isBroadcaster) {
  if (!state.isStreaming) {
    client.say(channelName, 'Raid command is only available while streaming 📺');
    return;
  }

  if (isBroadcaster) {
    const username = user.trim() ? user.trim().split(' ')[0].replace(/^@/, '') : 'TwisWua';
    const toChannelId = await getUserId(username);

    if (!toChannelId) {
      client.say(channelName, `Cannot find user: ${username}`);
      return;
    }

    try {
      await triggerRaid(toChannelId);
      const message = `Raiding ${username}!`;
      client.say(channelName, message);
      Constant.RaidMessage.forEach((msg, i) => setTimeout(() => client.say(channelName, msg), i * 1000));
      broadcastToClient({ type: 'TICKER', message, isVisible: true });
      broadcastToClient({ type: 'MUSIC', id: 'JEREMY_BLAKE_POWERUP', isPlaying: true });
    } catch (err) {
      client.say(channelName, `Failed to start raid to ${username}.`);
    }
  }

  client.say(channelName, "BosEriko Raid SUBtember BosEriko Raid TwitchConHYPE BosEriko Raid DinoDance BosEriko Raid PewPewPew BosEriko Raid BangbooBounce BosEriko Raid GoldPLZ BosEriko Raid MechaCharge BosEriko Raid EWCcrush BosEriko Raid");
}

module.exports = handleRaidUtility;
