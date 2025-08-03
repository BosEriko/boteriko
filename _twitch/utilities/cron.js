const cron = require('node-cron');
const env = require('@config/environments/base');
const state = require('@global/utilities/state');

// Utilities
const { broadcastToClient } = require('@global/utilities/websocket');
const handleClipUtility = require('@twitch/utilities/clip');
const handleErrorUtility = require('@global/utilities/error');
const handleFollowUtility = require('@twitch/utilities/follow');
const handleInformationUtility = require('@twitch/utilities/information');
const handleRaidUtility = require('@twitch/utilities/raid');
const handleSetupUtility = require('@twitch/utilities/setup');
const handleStreamDetailUtility = require("@global/utilities/streamDetail");

// Data
const getLastTypingWinner = require('@twitch/utilities/typingWinner');

function handleCronUtility(client) {
  const timezone = env.app.timeZone;
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
      await handleErrorUtility("Error checking stream availability:", error.message);
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

  // Clear Daily State Cache Function
  function clearDailyStateCache() {
    state.isFollowerInitialized = false;
    state.isClipInitialized = false;
    state.knownFollowerIds.clear();
    state.knownClipIds.clear();
    state.latestFollowTimestamp = null;
    state.latestClipTimestamp = null;
    state.todos = [];
    state.isTodoVisible = false;
    state.hasSkippedFirstAd = false;
    state.adCount = 0;
    state.shoutoutUsernames.clear();
    state.twitchUsers.clear();
  }

  // ------------------------------------------- Cron Jobs -------------------------------------------

  // Every 1 minute
  cron.schedule('* * * * *', async () => {
    loadStreamDetails();
    if (state.isStreaming) await handleFollowUtility(client);
  }, { timezone });

  // Every 10 minutes
  cron.schedule('*/10 * * * *', async () => {
    if (state.isStreaming) handleInformationUtility(client);
    await handleClipUtility();
  }, { timezone });

  // Every day 1 hour before stream start
  const streamStartHour = env.stream.start;
  const oneHourBeforeStream = (streamStartHour + 23) % 24;
  cron.schedule(`0 ${oneHourBeforeStream} * * *`, () => {
    retryWhenOffline(() => {
      clearDailyStateCache();
      handleSetupUtility(client);
    });
  }, { timezone });

  // Every end of stream
  const streamEndHour = parseInt(env.stream.start, 10) + parseInt(env.stream.duration, 10);
  cron.schedule(`0 ${streamEndHour} * * *`, () => {
    if (state.isStreaming) handleRaidUtility(client, "TwisWua", true);
  }, { timezone });
}

module.exports = handleCronUtility;
