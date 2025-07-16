const firebaseUtility = require('@global/utilities/firebase');
const cacheUtility = require('@global/utilities/cache');
const firstUtility = require('@global/utilities/first');
const handleStreamDetailUtility = require("@global/utilities/streamDetail");
const handleErrorUtility = require("@global/utilities/error");
const axios = require('axios');
const env = require('@global/utilities/env');

const ONE_HOUR_MS = 1 * 60 * 60 * 1000;
const firstChatCache = cacheUtility(ONE_HOUR_MS);

async function handleFirstUtility(isMod, isBroadcaster, user) {
  const username = user.login;
  if (!username || isMod || isBroadcaster) return;

  const cachedFirst = firstChatCache.get(username, 'first-chat');
  if (cachedFirst) return;

  const rtdb = firebaseUtility.database();
  const firstChat = await firstUtility(rtdb, username); // will return the existing or newly set username

  // Cache the actual first chatter (not the one who triggered it)
  firstChatCache.set(username, firstChat, 'first-chat');

  // Fetch current stream
  const stream = await handleStreamDetailUtility();
  if (!stream) return;

  const currentTitle = stream.title;

  // Remove any existing '| First: @...' from the title
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
