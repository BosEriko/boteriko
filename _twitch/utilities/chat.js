const { broadcastToClient } = require('@global/utilities/websocket');
const firebaseUtility = require('@global/utilities/firebase');
const dailyUtility = require('@global/utilities/daily');
const statisticUtility = require('@global/utilities/statistic');
const walletUtility = require('@global/utilities/wallet');
const sendToDiscordUtility = require('@twitch/utilities/sendToDiscord');
const state = require('@global/utilities/state');

function formatEmotes(emotes, message) {
  const result = {};
  if (!emotes || !message) return result;

  for (const [emoteId, positions] of Object.entries(emotes)) {
    for (const pos of positions) {
      const [start, end] = pos.split('-').map(Number);
      const name = message.substring(start, end + 1);
      result[name] = `https://static-cdn.jtvnw.net/emoticons/v2/${emoteId}/default/dark/2.0`;
    }
  }

  return result;
}

async function saveToRealtimeDatabase(user) {
  const rtdb = firebaseUtility.database();

  await Controller.Concern.sync_firebase_user(user);

  await Model.User.find_or_upsert_by({
    displayName: user?.display_name,
    profileImage: user?.profile_image_url,
    coverPhoto: user?.offline_image_url,
  }, user.id);

  await statisticUtility(rtdb, user.id, { twitchMessageCount: 1 });
  await walletUtility(rtdb, user.id, { coins: 1 });
  await dailyUtility(rtdb, user.id, 'twitchMessageCount');
}

async function handleChatUtility(user, message, emotes) {
  if (!user) return;

  broadcastToClient({
    type: 'FEED',
    feed_type: 'chat',
    username: user.display_name,
    message,
    emotes: formatEmotes(emotes, message)
  });

  await saveToRealtimeDatabase(user);
  if (state.isStreaming) await sendToDiscordUtility(user, message, Config.discord.webhook.streaming);
}

module.exports = handleChatUtility;
