module.exports = {
  // Stream-related state
  isStreaming: false,
  streamDetail: null,
  raidDestination: "TwisWua",

  // Ad-related state
  hasRunStartingAd: false,
  hasSkippedFirstAd: false,
  adCount: 0,

  // Stream Winners
  winners: {
    firstChat: null,
    typing: null,
  },

  // Follower-related state
  isFollowerInitialized: false,
  knownFollowerIds: new Set(),
  latestFollowTimestamp: null,

  // Clip-related state
  isClipInitialized: false,
  knownClipIds: new Set(),
  latestClipTimestamp: null,

  // Chat and interaction state
  lastMessageTimestamp: Date.now(),

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
