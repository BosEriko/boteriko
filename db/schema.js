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
      discord: { type: 'string', nullable: true },
      tetrio: { type: 'string', nullable: true },
    },
  },

  wallets: {
    type: 'realtime',
    columns: {
      coins: { type: 'number', default: 0 },
    },
  },

  statistics: {
    type: 'realtime',
    columns: {
      discordMessageCount: { type: 'number' },
      twitchMessageCount: { type: 'number' },
    },
  },

  dailies: {
    type: 'realtime',
    columns: {
      content: { type: 'object' },
    },
  },

  game_lists: {
    type: 'realtime',
    columns: {
      content: { type: 'object' },
    },
  },

  game_profiles: {
    type: 'firestore',
    columns: {
      id: { type: 'string' },
      name: { type: 'string' },
      thumbnail: { type: 'string' },
      year: { type: 'number' },
      nsfw: { type: 'boolean' },
    },
  },

  anime_lists: {
    type: 'realtime',
    columns: {
      content: { type: 'object' },
    },
  },

  anime_profiles: {
    type: 'firestore',
    columns: {
      id: { type: 'string' },
      name: { type: 'string' },
      thumbnail: { type: 'string' },
      year: { type: 'number' },
      nsfw: { type: 'boolean' },
    },
  },

  manga_lists: {
    type: 'realtime',
    columns: {
      content: { type: 'object' },
    },
  },

  manga_profiles: {
    type: 'firestore',
    columns: {
      id: { type: 'string' },
      name: { type: 'string' },
      thumbnail: { type: 'string' },
      year: { type: 'number' },
      nsfw: { type: 'boolean' },
    },
  },
};
