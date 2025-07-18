const firebaseUtility = require('@global/utilities/firebase');

async function handleWalletCommand(client, channel, user) {
  const rtdb = firebaseUtility.database();
  const userRef = rtdb.ref(`wallets/${user.id}`);
  const snap = await userRef.once('value');
  const data = snap.val() || {};

  const coins = data.coins || 0;

  client.say(
    channel,
    `@${user.display_name}, you have 💰 ${coins} Bos Coin${coins === 1 ? '' : 's'}!`
  );
}

module.exports = handleWalletCommand;
