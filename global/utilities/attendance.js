async function attendanceUtility(rtdb, twitchId, type) {
  const today = new Date().toISOString().slice(0, 10);
  const ref = rtdb.ref(`messages_counts/${twitchId}/content/${today}`);
  const snapshot = await ref.once('value');
  const existingCount = snapshot.val()?.[type] || 0;

  await ref.update({ [type]: existingCount + 1 });
}

module.exports = attendanceUtility;
