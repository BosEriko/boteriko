const env = require('@global/utilities/env');
const { broadcastToClient } = require('@global/utilities/websocket');
const firebaseUtility = require('@global/utilities/firebase');
const dailyUtility = require('@global/utilities/daily');
const statisticUtility = require('@global/utilities/statistic');
const walletUtility = require('@global/utilities/wallet');
const syncUserUtility = require('@global/utilities/syncUser');
const sendToDiscordUtility = require('@twitch/utilities/sendToDiscord');

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
  const auth = firebaseUtility.auth();

  await syncUserUtility(auth, user);
  await statisticUtility(rtdb, user.id, { twitchMessageCount: 1 });
  await walletUtility(rtdb, user.id, { coins: 1 });
  await dailyUtility(rtdb, user.id, 'twitchMessageCount');
}

async function handleChatUtility(user, message, emotes) {
  broadcastToClient({
    type: 'FEED',
    feed_type: 'chat',
    username: user.display_name,
    message,
    emotes: formatEmotes(emotes, message)
  });

  if (!user) return;

  await Promise.all([
    sendToDiscordUtility(user, message, env.discord.webhook.streaming),
    saveToRealtimeDatabase(user)
  ]);
}

module.exports = handleChatUtility;
