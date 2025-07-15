const getLastTypingWinner = require('@twitch/utilities/typingWinner');

async function handleTypingWinnerCommand(client, channel) {
  const result = await getLastTypingWinner();

  if (!result) {
    client.say(channel, 'No previous stream winner found!');
    return;
  }

  const { winner, score, date } = result;
  client.say(channel, `🎉 The winner from the ${date} stream was @${winner} with ${score} point${score === 1 ? '' : 's'}!`);
}

module.exports = handleTypingWinnerCommand;
