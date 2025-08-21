module.exports = {
  users: {
    type: 'firestore',
    columns: {
      age: { type: 'number' },
      displayName: { type: 'string', required: true },
      email: { type: 'string' },
      isRegistered: { type: 'boolean', default: false },
      profileImage: { type: 'string' },
      coverPhoto: { type: 'string' },
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
