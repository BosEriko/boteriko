const cron = require('node-cron');
const state = require('@global/utilities/state');

// Utilities
const { broadcastToClient } = require('@global/utilities/websocket');
const { handleAdUtility, runAd } = require('@twitch/utilities/ad');
const { handleTypingWords } = require('@twitch/games/typing');
const handleClipUtility = require('@twitch/utilities/clip');
const handleFollowUtility = require('@twitch/utilities/follow');
const handleInformationUtility = require('@twitch/utilities/information');
const handleRaidUtility = require('@twitch/utilities/raid');
const handleSetupUtility = require('@twitch/utilities/setup');
const handleStreamDetailUtility = require("@global/utilities/streamDetail");

// Data
const getLastTypingWinner = require('@twitch/utilities/typingWinner');

function handleCronUtility(client) {
  const timezone = Config.app.timeZone;
  // ------------------------------------------- Functions -------------------------------------------

  // Check Stream Availability Function
  async function loadStreamDetails() {
    try {
      const streamDetail = await handleStreamDetailUtility();
      const typingWinner = await getLastTypingWinner();
      state.streamDetail = streamDetail || null;
      state.isStreaming = !!streamDetail;
      state.winners.typing = typingWinner;
      broadcastToClient({
        type: 'STREAM_DETAIL',
        streamDetail: streamDetail || null,
        isStreaming: !!streamDetail,
        winners: {
          firstChat: state.winners.firstChat,
          typing: typingWinner,
        },
      });
    } catch (error) {
      state.streamDetail = null;
      state.isStreaming = false;
      await Utility.error_logger("Error checking stream availability:", error.message);
    }
  }

  // Cooldown Function
  function retryWhenOffline(callback) {
    if (state.isStreaming) {
      setTimeout(() => {
        retryWhenOffline(callback);
      }, 60 * 60 * 1000);
    } else {
      callback();
    }
  }

  // Initial Ad Function
  async function initialAd() {
    const success = await runAd();
    if (success) state.hasRunStartingAd = true;
  }

  // Clear Daily State Cache Function
  function clearDailyStateCache() {
    // Ad-related state
    state.hasRunStartingAd = false;
    state.hasSkippedFirstAd = false;
    state.adCount = 0;

    // Follower-related state
    state.isFollowerInitialized = false;
    state.knownFollowerIds.clear();
    state.latestFollowTimestamp = null;

    // Clip-related state
    state.isClipInitialized = false;
    state.knownClipIds.clear();
    state.latestClipTimestamp = null;

    // Todoist display toggle
    state.isTodoVisible = false;

    // Music state
    state.musicDetails = null;

    // Cache references
    state.caches.forEach(cache => cache._raw.clear());
  }

  // ------------------------------------------- Cron Jobs -------------------------------------------

  // Every 1 minute
  cron.schedule('* * * * *', async () => {
    await loadStreamDetails();
    if (state.isStreaming) await handleFollowUtility(client);
    if (state.isStreaming) handleTypingWords();
    if (state.isStreaming && !state.hasRunStartingAd) await initialAd();
  }, { timezone });

  // Every 10 minutes
  cron.schedule('*/10 * * * *', async () => {
    if (state.isStreaming) handleInformationUtility(client);
    await handleClipUtility();
  }, { timezone });

  // Every 30 minutes
  cron.schedule('*/30 * * * *', async () => {
    if (state.isStreaming) await handleAdUtility(client);
  }, { timezone });

  // Every day 1 hour before stream start
  const streamStartHour = parseInt(Config.stream.start, 10);
  const oneHourBeforeStream = (streamStartHour + 23) % 24;
  cron.schedule(`0 ${oneHourBeforeStream} * * *`, () => {
    retryWhenOffline(() => {
      clearDailyStateCache();
      handleSetupUtility(client);
    });
  }, { timezone });

  // Every end of stream
  const streamEndHour = parseInt(Config.stream.start, 10) + parseInt(Config.stream.duration, 10);
  cron.schedule(`0 ${streamEndHour} * * *`, () => {
    if (state.isStreaming) handleRaidUtility(client, "TwisWua", true);
  }, { timezone });
}

module.exports = handleCronUtility;
