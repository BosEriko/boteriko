async function typingUtility(rtdb, username, incrementBy = 1) {
  if (!username) return;

  const today = new Date().toISOString().slice(0, 10);
  const ref = rtdb.ref(`typings/${today}/${username}`);

  await ref.transaction(current => (current || 0) + incrementBy);
}

module.exports = typingUtility;
