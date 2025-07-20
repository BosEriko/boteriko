const { broadcastToClient } = require('@global/utilities/websocket');
const llmUtility = require('@global/utilities/llm');
const cacheUtility = require('@global/utilities/cache');
const handleAnnouncementUtility = require('@twitch/utilities/announcement');
const handleErrorUtility = require('@global/utilities/error');

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
      `Create a Twitch shoutout message for a streamer named ${user.display_name}. Their about section says: "${description}".`
    );

    shoutoutCache.set(username, shoutoutMessage, 'shoutouts');
    broadcastToClient({
      type: 'FEED',
      feed_type: 'shoutout',
      user: {
        id: user?.id,
        profile_image_url: user?.profile_image_url || null,
        display_name: user?.display_name,
        broadcaster_type: user?.broadcaster_type || "viewer",
        created_at: user?.created_at ? new Date(user.created_at).toISOString().slice(0, 10).replace(/-/g, '/'): null
      }
    });
    await handleAnnouncementUtility(`🤖 ${shoutoutMessage}`);
  } catch (err) {
    await handleErrorUtility('❌ Shoutout error:', err?.response?.data || err.message);
    await handleAnnouncementUtility(`Shoutout to @${username}! Thanks for dropping by!`);
  } finally {
    inProgressUsers.delete(username);
  }
}

module.exports = handleShoutoutUtility;
