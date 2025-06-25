const env = require('@global/utilities/env');
const broadcastToClient = require('@global/utilities/websocket');
const llmUtility = require('@global/utilities/llm');
const cacheUtility = require('@global/utilities/cache');
const announcementUtility = require('@twitch/utilities/announcement.js');

const TWELVE_HOURS_MS = 12 * 60 * 60 * 1000;
const shoutoutCache = cacheUtility(TWELVE_HOURS_MS);

const inProgressUsers = new Set();

async function handleShoutoutUtility(isMod, isBroadcaster, user) {
  const username = user.login;
  const cachedShoutout = shoutoutCache.get(username, 'shoutouts');
  if (cachedShoutout || inProgressUsers.has(username) || isMod || isBroadcaster || !['affiliate', 'partner'].includes(user.broadcaster_type)) return;

  inProgressUsers.add(username);

  try {
    const description = user?.description || "a mysterious guest with no description";

    const shoutoutMessage = await llmUtility(
      'You are a friendly and funny shoutout bot for Twitch chat. Your job is to make viewers feel welcome based on their bio.',
      `Create a Twitch shoutout message for a streamer named ${user.display_name}. Their about section says: "${description}". Make it engaging but short — maximum 300 characters. End the message cleanly and keep the text Twitch Chat friendly.`
    );

    shoutoutCache.set(username, shoutoutMessage, 'shoutouts');
    broadcastToClient({ type: 'SHOUTOUT_DETAILS', url: user?.profile_image_url || null, username: username });
    await announcementUtility(`🤖 ${shoutoutMessage}`);
  } catch (err) {
    console.error('❌ Shoutout error:', err?.response?.data || err.message);
    await announcementUtility(`Shoutout to @${username}! Thanks for dropping by!`);
  } finally {
    inProgressUsers.delete(username);
  }
}

module.exports = handleShoutoutUtility;
