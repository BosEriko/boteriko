const firebaseUtility = require('@global/utilities/firebase');
const cacheUtility = require('@global/utilities/cache');
const firstUtility = require('@global/utilities/first');

const ONE_HOUR_MS = 1 * 60 * 60 * 1000;
const firstChatCache = cacheUtility(ONE_HOUR_MS);

async function handleFirstUtility(isMod, isBroadcaster, user, client) {
  const rtdb = firebaseUtility.database();
  const username = user.login;
  const cachedFirst = firstChatCache.get(username, 'first-chat');
  if (cachedFirst || isMod || isBroadcaster) return;

  const firstChat = await firstUtility(rtdb, username);

  firstChatCache.set(username, username, 'first-chat');
}

module.exports = handleFirstUtility;