const firebaseUtility = require('@global/utilities/firebase');

async function getLastTypingWinner() {
  const today = new Date().toISOString().slice(0, 10);
  const ref = firebaseUtility.database().ref('typings');

  const snapshot = await ref.once('value');
  const allDatesData = snapshot.val();

  if (!allDatesData) return null;

  const previousDates = Object.keys(allDatesData)
    .filter(date => date < today)
    .sort()
    .reverse();

  const lastStreamDate = previousDates[0];
  if (!lastStreamDate) return null;

  const leaderboard = allDatesData[lastStreamDate];
  const sorted = Object.entries(leaderboard).sort((a, b) => b[1] - a[1]);

  if (!sorted.length) return null;

  const [winner, score] = sorted[0];
  return { winner, score, date: lastStreamDate };
}

module.exports = getLastTypingWinner;
