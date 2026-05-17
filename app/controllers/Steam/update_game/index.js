const state = require('@global/utilities/state');
const get_game = require('../get_game');

const channelName = `#${Config.twitch.channel.username}`;

const update_game = async (client) => {
  const currentGame = await get_game();
  if (!currentGame || state.lastGameUpdate === currentGame) return;

  await Controller.Twitch.update_game(currentGame);

  client.say(channelName, `🎮 Game updated to ${currentGame}`);
  state.lastGameUpdate = currentGame;
};

module.exports = update_game;
