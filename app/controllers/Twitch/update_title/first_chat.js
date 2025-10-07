const firebase_admin = require('../../concerns/firebase_admin');

async function first_chat() {
  const today = new Date().toISOString().slice(0, 10);
  const ref = firebase_admin.database().ref(`streams/${today}/firstChat`);
  const snap = await ref.once('value');
  return snap.val();
}

module.exports = first_chat;
