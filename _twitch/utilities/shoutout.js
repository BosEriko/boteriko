const { broadcastToClient } = require('@global/utilities/websocket');
const cacheUtility = require('@global/utilities/cache');
const handleAnnouncementUtility = require('@twitch/utilities/announcement');
const Utility = require("@utility");;

const TWELVE_HOURS_MS = 12 * 60 * 60 * 1000;
const shoutoutCache = cacheUtility(TWELVE_HOURS_MS);

const inProgressUsers = new Set();

async function handleShoutoutUtility(isMod, isBroadcaster, user) {
  const username = user.login;
  const cachedShoutout = shoutoutCache.get(username, 'shoutouts');
  if (cachedShoutout || inProgressUsers.has(username) || isMod || isBroadcaster || !['affiliate', 'partner'].includes(user.broadcaster_type)) return;

  inProgressUsers.add(username);

  try {
    const shoutoutMessage = `Big shoutout to ${user?.display_name}! Catch their stream at https://twitch.tv/${user?.display_name}`;
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
    await handleAnnouncementUtility(`🎉 ${shoutoutMessage}`);
  } catch (err) {
    await Utility.error_logger('❌ Shoutout error:', err?.response?.data || err.message);
  } finally {
    inProgressUsers.delete(username);
  }
}

module.exports = handleShoutoutUtility;
