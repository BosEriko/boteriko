const { broadcastToClient } = require('@global/utilities/websocket');
const channelName = Config.twitch.channel.username;
const axios = require('axios');

async function connect(userId, sessionId, clientId, accessToken) {
  await axios.post('https://api.twitch.tv/helix/eventsub/subscriptions', {
    type: 'channel.channel_points_custom_reward_redemption.add',
    version: '1',
    condition: { broadcaster_user_id: userId },
    transport: { method: 'websocket', session_id: sessionId }
  }, {
    headers: {
      'Client-ID': clientId,
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    }
  });
  return "✅ Connected to Channel Points WebSocket.";
}

async function trigger(client, payload) {
  const { reward, user_id, user_name, user_input, id } = payload;

  try {
    switch (reward.title) {
      case Constant.String.BLINK:
      case Constant.String.STRETCH:
      case Constant.String.HYDRATE: {
        broadcastToClient({ type: 'SOUND_ALERT', id: reward.title.toUpperCase().replace(/\s+/g, '_') });
        client.say(channelName, `${user_name} played "${reward.title}" for ${reward.cost} channel points!`);
        break;
      }

      case Constant.String.STAND_UP: {
        broadcastToClient({ type: 'SOUND_ALERT', id: "STAND_UP" });
        client.say(channelName, `${user_name} played "${reward.title}" for ${reward.cost} channel points!`);

        setTimeout(() => {
          broadcastToClient({ type: 'SOUND_ALERT', id: "SIT_DOWN" });
          client.say(channelName, `10 minutes passed since ${user_name} redeemed "Stand Up"! Time to sit down and make your legs rest.`);
        }, 10 * 60 * 1000);

        break;
      }

      case Constant.String.ADD_TO_QUEUE: {
        const result = await Controller.Music.add_to_queue(user_input, user_name);
        await Controller.Twitch.update_channel_request(reward, id, result.success);
        client.say(channelName, result.message);
        break;
      }

      default:
        console.warn(`⚠️ Unhandled reward: "${reward.title}"`);
        break;
    }
  } catch (err) {
    await Utility.error_logger(`Error handling reward "${reward.title}" for ${user_name}:`, err);
  }
};

const points = {
  connect,
  trigger,
};

module.exports = points;
