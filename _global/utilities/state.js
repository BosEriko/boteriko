module.exports = {
  // Stream-related state
  isStreaming: false,
  streamDetail: null,
  autoRaid: true,
  raidDestination: "TwisWua",

  // Stream Winners
  winners: {
    firstChat: null,
    typing: null,
  },

  // Follower-related state
  isFollowerInitialized: false,
  knownFollowerIds: new Set(),

  // Clip-related state
  isClipInitialized: false,
  knownClipIds: new Set(),

  // Steam state
  steam: {
    gameName: null,
    gameId: null,
  },

  // Timestamps
  timestamp: {
    message: Date.now(),
    clip: null,
    follow: null,
  },

  // Todoist display toggle
  isTodoVisible: false,

  // Music state
  music: {
    details: null,
    queue: new Set()
  },

  // Cache references
  caches: [],
};
