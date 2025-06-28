module.exports = {
  isFollowerInitialized: false,
  isStreaming: false,
  knownFollowerIds: new Set(),
  lastMessageTimestamp: Date.now(),
  typingLeaderboard: {},
};
