const informationConstant = require('@global/constants/information');

let informationIndex = 0;

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

shuffle(informationConstant);

function handleInformationUtility(client, username) {
  const message = informationConstant[informationIndex];
  client.say(`#${username}`, `📢 ${message}`);

  informationIndex = (informationIndex + 1) % informationConstant.length;
}

module.exports = handleInformationUtility;