const { broadcastToClient } = require('@global/utilities/websocket');
const state = require('@global/utilities/state');
const handleAnnouncementUtility = require('@twitch/utilities/announcement');
const handleErrorUtility = require('@global/utilities/error');

const inProgressUsers = new Set();

async function handleShoutoutUtility(isMod, isBroadcaster, user) {
  const username = user.login;
  const alreadyShoutedOut = state.shoutoutUsernames.has(username);
  if (alreadyShoutedOut || inProgressUsers.has(username) || isMod || isBroadcaster || !['affiliate', 'partner'].includes(user.broadcaster_type)) return;

  inProgressUsers.add(username);

  try {
    const shoutoutMessage = `Big shoutout to ${user?.display_name}! Catch their stream at https://twitch.tv/${user?.display_name}`;
    state.shoutoutUsernames.add(username);
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
    await handleErrorUtility('❌ Shoutout error:', err?.response?.data || err.message);
  } finally {
    inProgressUsers.delete(username);
  }
}

module.exports = handleShoutoutUtility;
