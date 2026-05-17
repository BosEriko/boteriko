const state = require('@global/utilities/state');
const get_game = require('../get_game');

const channelName = `#${Config.twitch.channel.username}`;
const FIFTEEN_MINUTES = 15 * 60 * 1000;

const update_game = async (client) => {
  const currentGame = await get_game();

  if (!currentGame) return;

  const lastUpdate = state.timestamp.updateGame;

  const now = Date.now();
  const shouldUpdate = !lastUpdate || (now - lastUpdate >= FIFTEEN_MINUTES);

  if (!shouldUpdate) return;

  await Controller.Twitch.update_game(currentGame);

  client.say(channelName, `🎮 Game updated to ${currentGame}`);

  state.timestamp.updateGame = now;
};

module.exports = update_game;
