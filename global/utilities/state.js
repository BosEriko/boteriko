module.exports = {
  isFollowerInitialized: false,
  isClipInitialized: false,
  isStreaming: false,
  knownFollowerIds: new Set(),
  knownClipIds: new Set(),
  latestFollowTimestamp: null,
  latestClipTimestamp: null,
  lastMessageTimestamp: Date.now(),
  typingLeaderboard: {},
  todos: [],
  isTodoVisible: true,
};
