const state = require('@global/utilities/state');
const get_game = require('../get_game');
const get_description = require('../get_description');

const channelName = `#${Config.twitch.channel.username}`;

const update_twitch = async (client) => {
  const currentGame = await get_game();
  if (!currentGame || state.steam.gameName === currentGame) return;

  client.say(channelName, await Controller.Twitch.update_game(currentGame));
  state.steam.gameName = currentGame;

  const currentDescription = await get_description(currentGame);
  if (!currentDescription) return;

  client.say(channelName, await Controller.Twitch.update_title(currentDescription));
};

module.exports = update_twitch;
