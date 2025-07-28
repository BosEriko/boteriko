const Controller = require("@controller");

const firebaseUtility = require('@global/utilities/firebase');
const cacheUtility = require('@global/utilities/cache');
const firstUtility = require('@global/utilities/first');
const handleStreamDetailUtility = require("@global/utilities/streamDetail");
const handleErrorUtility = require("@global/utilities/error");
const axios = require('axios');
const env = require('@config/environments/base');
const state = require('@global/utilities/state');

const THIRTY_MINUTES_MS = 30 * 60 * 1000;
const firstChatCache = cacheUtility(THIRTY_MINUTES_MS);

async function handleFirstUtility(isMod, isBroadcaster, user) {
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

  const titleGenerator = Controller.Concern.TitleGenerator(stream.title);
  const newTitle = titleGenerator.append("First Chatter", `@${firstChat}`);

  try {
    await axios.patch(
      `https://api.twitch.tv/helix/channels?broadcaster_id=${env.twitch.channel.id}`,
      { title: newTitle },
      {
        headers: {
          'Client-ID': env.twitch.channel.clientId,
          'Authorization': `Bearer ${env.twitch.channel.accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );
  } catch (error) {
    await handleErrorUtility('Error updating stream title:', error);
  }
}

module.exports = handleFirstUtility;
