// DOCS: https://dev.twitch.tv/docs/api/reference#start-a-raid
const axios = require('axios');
const read_users_id = require('../read_users_id');
const { broadcastToClient } = require('@global/utilities/websocket');
const { state } = require('@global/utilities/state');

const channelName = `#${Config.twitch.channel.username}`;

const create_raid = async (client, user, threshold = state.raidThreshold) => {
  const username = user.trim() ? user.trim().split(' ')[0].replace(/^@/, '') : state.raidDestination;
  const toChannelId = await read_users_id([username])[0];

  if (!toChannelId) {
    client.say(channelName, `❌ Cannot find user: ${username}`);
    return;
  }

  if (!(await Controller.Twitch.read_stream_details(username))) {
    client.say(channelName, `❌ ${username} is currently offline.`);
    return;
  }

  if (state.streamDetail?.viewer_count < threshold) {
    client.say(channelName, `❌ You don't have enough viewers to raid. You currently have ${state.streamDetail?.viewer_count} but you need ${threshold}.`);
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
