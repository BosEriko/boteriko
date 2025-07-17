async function firstUtility(rtdb, username, isStreaming = false) {
  if (!username) return null;
  if (!isStreaming) return username;

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
