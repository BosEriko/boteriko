let informationIndex = 0;
let lastShuffleDate = null;

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

function isNewDay() {
  const today = new Date().toDateString();
  return lastShuffleDate !== today;
}

function handleInformationUtility(client) {
  if (isNewDay()) {
    shuffle(Constant.Information);
    informationIndex = 0;
    lastShuffleDate = new Date().toDateString();
  }

  const message = Constant.Information[informationIndex];
  client.say(`#${Config.twitch.channel.username}`, `📢 ${message}`);

  informationIndex = (informationIndex + 1) % Constant.Information.length;
}

module.exports = handleInformationUtility;