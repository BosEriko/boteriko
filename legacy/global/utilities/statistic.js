async function statisticUtility(rtdb, userId, fields = {}) {
  const userRef = rtdb.ref(`statistics/${userId}`);
  const snap = await userRef.once('value');
  const existing = snap.val() || {};

  const updates = {};
  for (const [key, increment] of Object.entries(fields)) {
    updates[key] = (existing[key] || 0) + increment;
  }

  await userRef.update(updates);
}

module.exports = statisticUtility;
