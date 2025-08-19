module.exports = {
  users: {
    type: 'firestore',
    columns: {
      age: { type: 'number', default: 0 },
      discordId: { type: 'string' },
      displayName: { type: 'string', required: true },
      email: { type: 'string' },
      isRegistered: { type: 'boolean' },
      profileImage: { type: 'string' },
    },
  },

  wallets: {
    type: 'realtime',
    columns: {
      coins: { type: 'number', default: 0 },
    },
  },
};
