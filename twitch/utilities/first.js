const firebaseUtility = require('@global/utilities/firebase');
const cacheUtility = require('@global/utilities/cache');
const firstUtility = require('@global/utilities/first');
const handleStreamDetailUtility = require("@global/utilities/streamDetail");
const handleErrorUtility = require("@global/utilities/error");
const axios = require('axios');
const env = require('@global/utilities/env');

const THIRTY_MINUTES_MS = 30 * 60 * 1000;
const firstChatCache = cacheUtility(THIRTY_MINUTES_MS);

async function handleFirstUtility(isMod, isBroadcaster, user) {
  const username = user.login;
  if (!username || isMod || isBroadcaster) return;

  const today = new Date().toISOString().slice(0, 10);

  const cachedFirst = firstChatCache.get(today, 'first-chat');
  if (cachedFirst) return;

  const rtdb = firebaseUtility.database();
  const firstChat = await firstUtility(rtdb, username);

  firstChatCache.set(today, firstChat, 'first-chat');

  const stream = await handleStreamDetailUtility();
  if (!stream) return;

  const currentTitle = stream.title;

  const cleanedTitle = currentTitle.replace(/\s*\|\s*First: @\w+/, '');
  const newTitle = `${cleanedTitle} | First: @${firstChat}`;

  try {
    await axios.patch(
      `https://api.twitch.tv/helix/channels?broadcaster_id=${env.twitch.channel.id}`,
      { title: newTitle },
      {
        headers: {
          'Client-ID': env.twitch.bot.clientId,
          'Authorization': `Bearer ${env.twitch.bot.accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );
  } catch (error) {
    await handleErrorUtility('Error updating stream title:', error);
  }
}

module.exports = handleFirstUtility;
