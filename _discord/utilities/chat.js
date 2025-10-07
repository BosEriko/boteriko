const dailyUtility = require('@global/utilities/daily');
const statisticUtility = require('@global/utilities/statistic');
const walletUtility = require('@global/utilities/wallet');

async function handleChatUtility(discordId) {
  const rtdb = Controller.Concern.firebase_admin.database();
  const connection = await Model.Connection.find_by({ discord: discordId });
  if (!connection) return;

  await statisticUtility(rtdb, connection.id, { discordMessageCount: 1 });
  await walletUtility(rtdb, connection.id, { coins: 1 });
  await dailyUtility(rtdb, connection.id, 'discordMessageCount');
}

module.exports = handleChatUtility;
