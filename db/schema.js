module.exports = {
  users: {
    type: 'firestore',
    columns: {
      name: { type: 'string', required: true },
      email: { type: 'string' },
      age: { type: 'number', default: 0 },
    },
  },

  wallets: {
    type: 'realtime',
    columns: {
      user_id: { type: 'string', required: true },
      balance: { type: 'number', default: 0 },
    },
  },
};
