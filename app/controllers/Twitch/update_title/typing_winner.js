const firebase_admin = require('../../concerns/firebase_admin');
const cacheUtility = require('@global/utilities/cache');
const cache = cacheUtility();

async function typing_winner() {
  const today = new Date().toISOString().slice(0, 10);

  const cached = cache.get(today, "typing-winner");
  if (cached) return cached;

  const ref = firebase_admin.database().ref('typings');
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
  const result = { winner, score, date: lastStreamDate };

  cache.set(today, result, "typing-winner");
  return result;
}

module.exports = typing_winner;
