const env = require('@global/utilities/env');
const informationConstant = require('@global/constants/information');

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
    shuffle(informationConstant);
    informationIndex = 0;
    lastShuffleDate = new Date().toDateString();
  }

  const message = informationConstant[informationIndex];
  client.say(`#${env.twitch.channel.username}`, `📢 ${message}`);

  informationIndex = (informationIndex + 1) % informationConstant.length;
}

module.exports = handleInformationUtility;