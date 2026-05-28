async function handleTypingTopCommand(client, channel) {
  const MAX_ENTRIES = 5;
  const today = new Date().toISOString().slice(0, 10);
  const ref = Controller.Concern.firebase_admin.database().ref(`typings/${today}`);

  const snapshot = await ref.once('value');
  const data = snapshot.val();

  if (!data) {
    client.say(channel, 'No one has scored yet!');
    return;
  }

  const sorted = Object.entries(data)
    .sort((a, b) => b[1] - a[1])
    .slice(0, MAX_ENTRIES);

  const response = sorted
    .map(([username, count], i) => `${i + 1}. ${username} (${count})`)
    .join(' | ');

  client.say(channel, `🏆 Leaderboard: ${response}`);
}

module.exports = handleTypingTopCommand;
