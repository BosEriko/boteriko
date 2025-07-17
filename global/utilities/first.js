const handleStreamDetailUtility = require("@global/utilities/streamDetail");

async function firstUtility(rtdb, username) {
  const streamDetail = await handleStreamDetailUtility();

  if (!username) return null;
  if (!streamDetail) return username;

  const today = new Date().toISOString().slice(0, 10);
  const ref = rtdb.ref(`streams/${today}/firstChat`);
  const snap = await ref.once('value');

  let firstChatter = snap.val();

  if (firstChatter === null) {
    await ref.set(username);
    firstChatter = username;
  }

  return firstChatter;
}

module.exports = firstUtility;
