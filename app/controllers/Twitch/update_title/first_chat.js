const firebaseUtility = require('@global/utilities/firebase');

async function first_chat() {
  const today = new Date().toISOString().slice(0, 10);
  const ref = firebaseUtility.ref(`streams/${today}/firstChat`);
  const snap = await ref.once('value');
  return snap.val();
}

module.exports = first_chat;
