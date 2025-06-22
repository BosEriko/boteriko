const firebaseUtility = require('@global/utilities/firebase');
const dailyUtility = require('@global/utilities/daily');
const statisticUtility = require('@global/utilities/statistic');
const getTwitchIdUtility = require('@discord/utilities/getTwitchId');

async function saveToRealtimeDatabase(discordId) {
  const rtdb = firebaseUtility.database();
  const twitchId = await getTwitchIdUtility(discordId);
  if (!twitchId) return;

  await statisticUtility(rtdb, twitchId, { discordMessageCount: 1, coins: 1 });
  await dailyUtility(rtdb, twitchId, 'discordMessageCount');
}

async function handleChatUtility(discordId) {
  await saveToRealtimeDatabase(discordId);
}

module.exports = handleChatUtility;
