// REMOVE START
const firebaseUtility = require('@global/utilities/firebase');

async function renameDailyToDailies() {
  const rtdb = firebaseUtility.database();

  // Step 1: Get all data under "daily"
  const dailySnapshot = await rtdb.ref('daily').once('value');
  const dailyData = dailySnapshot.val();

  if (!dailyData) {
    console.log('No data found under "daily".');
    return;
  }

  // Step 2: Write to "dailies"
  await rtdb.ref('dailies').set(dailyData);
  console.log('Copied "daily" data to "dailies".');
}

module.exports = renameDailyToDailies;
// REMOVE END