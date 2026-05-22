const state = require('@global/utilities/state');
const get_description = require('../get_description');
const get_game = require('../get_game');
const get_id = require('../get_id');

const channelName = `#${Config.twitch.channel.username}`;

const update_twitch = async (client) => {
  const currentGame = await get_game();
  if (!currentGame) return;
  client.say(channelName, await Controller.Twitch.update_game(currentGame));
  state.steam.gameName = currentGame;

  const currentId = await get_id(currentGame);
  if (!currentId) return;
  state.steam.gameId = currentId;

  const currentDescription = await get_description(currentId);
  if (!currentDescription) return;
  client.say(channelName, await Controller.Twitch.update_title(currentDescription));
  state.steam.gameDescription = currentDescription;
};

module.exports = update_twitch;
