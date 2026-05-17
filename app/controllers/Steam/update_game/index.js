const state = require('@global/utilities/state');
const get_game = require('../get_game');

const FIFTEEN_MINUTES = 15 * 60 * 1000;

const update_game = async () => {
  const currentGame = await get_game();

  if (!currentGame) return;

  const lastUpdate = state.timestamp.updateGame;

  const now = Date.now();
  const shouldUpdate = !lastUpdate || (now - lastUpdate >= FIFTEEN_MINUTES);

  if (!shouldUpdate) return;

  await Controller.Twitch.update_game(currentGame);

  state.timestamp.updateGame = now;
};

module.exports = update_game;
