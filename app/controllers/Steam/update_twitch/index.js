const { state } = require('@global/utilities/state');
const get_achievement = require('../get_achievement/');
const get_description = require('../get_description');
const get_game = require('../get_game');
const get_id = require('../get_id');

const channelName = `#${Config.twitch.channel.username}`;

const update_twitch = async (client) => {
  const currentGame = await get_game();
  if (!currentGame) {
    state.steam.gameName = null;
    state.steam.gameId = null;
    state.steam.gameDescription = null;
    state.steam.gamePercent = null;
    return;
  }
  
  const currentId = await get_id(currentGame);
  if (currentId) {
    if (state.steam.gameName === currentGame) {
      const currentProgress = await get_achievement(currentId);
      const previousProgress = state.steam.gamePercent;
      if (previousProgress !== currentProgress) {
        client.say(channelName, await `${Config.twitch.channel.username} has increased his progress on ${state.steam.gameName} from ${previousProgress}% to ${currentProgress}%! Check more details at https://steamcommunity.com/id/${Config.twitch.channel.username}/stats/${state.steam.gameId}/achievements`);
        state.steam.gamePercent = currentProgress;
      }
    } else {
      client.say(channelName, await Controller.Twitch.update_game(currentGame));
      state.steam.gameName = currentGame;
      state.steam.gameId = currentId;
      state.steam.gamePercent = await get_achievement(currentId);
      
      const currentDescription = await get_description(currentId);
      if (currentDescription) {
        client.say(channelName, await Controller.Twitch.update_title(currentDescription));
        state.steam.gameDescription = currentDescription;
      } else {
        client.say(channelName, await Controller.Twitch.update_title(currentGame))
        state.steam.gameDescription = null;
      };
    };
  }
};

module.exports = update_twitch;
