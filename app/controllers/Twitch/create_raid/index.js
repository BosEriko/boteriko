// DOCS: https://dev.twitch.tv/docs/api/reference#start-a-raid
const axios = require('axios');
const read_user_id = require('../read_user_id');
const { broadcastToClient } = require('@global/utilities/websocket');
const { state } = require('@global/utilities/state');

const channelName = `#${Config.twitch.channel.username}`;

const create_raid = async (client, user, threshold = 1) => {
  const username = user.trim() ? user.trim().split(' ')[0].replace(/^@/, '') : state.raidDestination;
  const toChannelId = await read_user_id(username);

  if (!toChannelId) {
    client.say(channelName, `❌ Cannot find user: ${username}`);
    return;
  }

  try {
    await axios.post(
      `https://api.twitch.tv/helix/raids?from_broadcaster_id=${Config.twitch.channel.id}&to_broadcaster_id=${toChannelId}`, null,
      {
        headers: {
          Authorization: `Bearer ${Config.twitch.channel.accessToken}`,
          'Client-Id': Config.twitch.channel.clientId
        }
      }
    );

    const message = `Raiding ${username}!`;
    client.say(channelName, message);
    Constant.RaidMessage.forEach((msg, i) => setTimeout(() => client.say(channelName, msg), i * 1000));
    broadcastToClient({ type: 'TICKER', message, isVisible: true });
    broadcastToClient({ type: 'MUSIC', id: 'JEREMY_BLAKE_POWERUP', isPlaying: true });
  } catch (err) {
    client.say(channelName, `❌ Failed to start raid to ${username}.`);
  }
}

module.exports = create_raid;
