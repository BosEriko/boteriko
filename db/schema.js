module.exports = {
  users: {
    type: 'firestore',
    columns: {
      age: { type: 'number' },
      discordId: { type: 'string' },
      displayName: { type: 'string', required: true },
      email: { type: 'string' },
      isRegistered: { type: 'boolean', default: false },
      profileImage: { type: 'string' },
    },
  },

  connections: {
    type: 'firestore',
    columns: {
      discord: { type: 'string' },
      tetrio: { type: 'string' },
    },
  },

  wallets: {
    type: 'realtime',
    columns: {
      coins: { type: 'number', default: 0 },
    },
  },
};
