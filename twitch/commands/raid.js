const axios = require('axios');
const { broadcastToClient } = require('@global/utilities/websocket');
const handleErrorUtility = require('@global/utilities/error');
const env = require('@global/utilities/env');
const state = require('@global/utilities/state');

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
    await handleErrorUtility('Failed to fetch user ID:', err.response?.data || err.message);
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
    await handleErrorUtility('Failed to start raid:', err.response?.data || err.message);
    throw new Error('Unable to start raid');
  }
}

async function handleRaidCommand(client, channel, message, isBroadcaster) {
  if (!state.isStreaming) {
    client.say(channel, 'Raid command is only available while streaming 📺');
    return;
  }

  if (!isBroadcaster) {
    const username = message.trim().split(' ')[0].replace(/^@/, '');
    const toChannelId = await getUserId(username);

    if (!toChannelId) {
      client.say(channel, `Cannot find user: ${username}`);
      return;
    }

    try {
      await triggerRaid(toChannelId);
      client.say(channel, `Raiding ${username}! Thank you for the stream!`);
      broadcastToClient({ type: 'RAID', username: username });
    } catch (err) {
      client.say(channel, `Failed to start raid to ${username}.`);
    }
  }

  client.say(channel, "Bos Raid TombRaid Bos Raid TombRaid Bos Raid TombRaid");
}

module.exports = handleRaidCommand;
