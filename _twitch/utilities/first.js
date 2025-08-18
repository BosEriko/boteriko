const firebaseUtility = require('@global/utilities/firebase');
const cacheUtility = require('@global/utilities/cache');
const firstUtility = require('@global/utilities/first');
const handleStreamDetailUtility = require("@global/utilities/streamDetail");
const axios = require('axios');
const state = require('@global/utilities/state');

const TWELVE_HOURS_MS = 12 * 60 * 60 * 1000;
const firstChatCache = cacheUtility(TWELVE_HOURS_MS);

const channelName = `#${Config.twitch.channel.username}`;

async function handleFirstUtility(isMod, isBroadcaster, user, client) {
  const username = user.display_name || user.login;
  if (!username || isMod || isBroadcaster) return;

  const today = new Date().toISOString().slice(0, 10);

  const cachedFirst = firstChatCache.get(today, 'first-chat');
  if (cachedFirst) return;

  const stream = await handleStreamDetailUtility();
  if (!stream) return;

  const firstChat = await firstUtility(firebaseUtility.database(), username, !!stream);

  firstChatCache.set(today, firstChat, 'first-chat');
  state.winners.firstChat = firstChat;

  const titleGenerator = Controller.Concern.title_generator(stream.title);
  const newTitle = titleGenerator.append("First Chatter", `@${firstChat}`);

  try {
    await axios.patch(
      `https://api.twitch.tv/helix/channels?broadcaster_id=${Config.twitch.channel.id}`,
      { title: newTitle },
      {
        headers: {
          'Client-ID': Config.twitch.channel.clientId,
          'Authorization': `Bearer ${Config.twitch.channel.accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );
    client.say(channelName, `Thanks for being the first chatter, @${firstChat}! Welcome to the stream!`);
  } catch (error) {
    await Utility.error_logger('Error updating stream title:', error);
  }
}

module.exports = handleFirstUtility;
