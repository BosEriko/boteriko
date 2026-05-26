const { state } = require('@global/utilities/state');
const get_achievement = require('../get_achievement/');
const get_description = require('../get_description');
const get_game = require('../get_game');
const get_id = require('../get_id');

const channelName = `#${Config.twitch.channel.username}`;

const update_twitch = async (client) => {
  let currentId;

  const currentGame = await get_game();
  if (!currentGame) {
    state.steam.gameName = null;
    state.steam.gameId = null;
    state.steam.gameDescription = null;
    state.steam.gamePercent = null;
    return;
  }

  if (state.steam.gameName !== currentGame) {
    client.say(channelName, await Controller.Twitch.update_game(currentGame));
    state.steam.gameName = currentGame;

    currentId = await get_id(currentGame);
    if (currentId) {
      state.steam.gameId = currentId;
      const currentDescription = await get_description(currentId);
      if (currentDescription) {
        client.say(channelName, await Controller.Twitch.update_title(currentDescription));
        state.steam.gameDescription = currentDescription;
      } else {
        client.say(channelName, await Controller.Twitch.update_title(currentGame))
        state.steam.gameDescription = null;
      };
    };
  };

  if (currentId) {
    state.steam.gamePercent = await get_achievement(currentId);
  }
};

module.exports = update_twitch;
