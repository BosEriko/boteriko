const firebaseUtility = require('@global/utilities/firebase');

async function handleTypingWinnerCommand(client, channel) {
  const today = new Date().toISOString().slice(0, 10);
  const ref = firebaseUtility.database().ref('typings');

  const snapshot = await ref.once('value');
  const allDatesData = snapshot.val();

  if (!allDatesData) {
    client.say(channel, 'No stream data found!');
    return;
  }

  const previousDates = Object.keys(allDatesData)
    .filter(date => date < today)
    .sort()
    .reverse();

  const lastStreamDate = previousDates[0];

  if (!lastStreamDate) {
    client.say(channel, 'No previous stream data found!');
    return;
  }

  const leaderboard = allDatesData[lastStreamDate];
  const sorted = Object.entries(leaderboard).sort((a, b) => b[1] - a[1]);
  const [winner, score] = sorted[0];

  client.say(channel, `🎉 The winner from the ${lastStreamDate} stream was @${winner} with ${score} point${score === 1 ? '' : 's'}!`);
}

module.exports = handleTypingWinnerCommand;
