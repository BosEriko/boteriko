async function walletUtility(rtdb, userId, fields = {}) {
  const userRef = rtdb.ref(`wallets/${userId}`);
  const snap = await userRef.once('value');
  const existing = snap.val() || {};

  const updates = {};
  for (const [key, increment] of Object.entries(fields)) {
    updates[key] = (existing[key] || 0) + increment;
  }

  await userRef.update(updates);
}

module.exports = walletUtility;
