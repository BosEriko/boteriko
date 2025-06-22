const broadcastToClient = require('@global/utilities/websocket');
const llmUtility = require('@global/utilities/llm');
const cacheUtility = require('@global/utilities/cache');

const TWELVE_HOURS_MS = 12 * 60 * 60 * 1000;
const shoutoutCache = cacheUtility(TWELVE_HOURS_MS);

async function handleShoutoutUtility(client, channel, isMod, isBroadcaster, user, apiKey) {
  const username = user.login;
  const cachedShoutout = shoutoutCache.get(username, 'shoutouts');
  if (cachedShoutout || isMod || isBroadcaster || !['affiliate', 'partner'].includes(user.broadcaster_type)) return;

  try {
    const description = user?.description || "a mysterious guest with no description";

    const shoutoutMessage = await llmUtility(
      apiKey,
      'You are a friendly and funny shoutout bot for Twitch chat. Your job is to make viewers feel welcome based on their bio.',
      `Create a Twitch shoutout message for a streamer named ${user.display_name}. Their about section says: "${description}". Make it engaging but short — maximum 350 characters. End the message cleanly.`
    );

    shoutoutCache.set(username, shoutoutMessage, 'shoutouts');
    broadcastToClient({ type: 'SHOUTOUT_DETAILS', url: user?.profile_image_url || null, username: username });
    client.say(channel, `🤖 ${shoutoutMessage}`);
  } catch (err) {
    console.error('❌ Shoutout error:', err?.response?.data || err.message);
    client.say(channel, `Shoutout to @${username}! Thanks for dropping by!`);
  }
}

module.exports = handleShoutoutUtility;
