module.exports = {
  isFollowerInitialized: false,
  isClipInitialized: false,
  isStreaming: false,
  knownFollowerIds: new Set(),
  knownClipIds: new Set(),
  lastMessageTimestamp: Date.now(),
  typingLeaderboard: {},
};
