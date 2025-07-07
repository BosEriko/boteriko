const cron = require('node-cron');
const env = require('@global/utilities/env');
const state = require('@global/utilities/state');

// Utilities
const handleClipUtility = require('@twitch/utilities/clip');
const handleFactCommand = require('@global/commands/fact');
const handleFollowUtility = require('@twitch/utilities/follow');
const handleInformationUtility = require('@twitch/utilities/information');
const handleIsStreamingUtility = require("@global/utilities/isStreaming");
const handleSetupUtility = require('@twitch/utilities/setup');

function handleCronUtility(client) {
  const timezone = env.app.timeZone;
  // ------------------------------------------- Functions -------------------------------------------

  // Check Stream Availability Function
  async function checkStreamAvailability() {
    try {
      state.isStreaming = await handleIsStreamingUtility();
    } catch (error) {
      console.error("Error checking stream availability:", error.message);
    }
  }

  // Run Conversation Utility
  async function runConversationUtility() {
    const now = Date.now();
    const fiveMinutes = 5 * 60 * 1000;

    if (now - state.lastMessageTimestamp >= fiveMinutes) {
      client.say(`#${env.twitch.channel.username}`, `💡 ${await handleFactCommand()}`);
      state.lastMessageTimestamp = now;
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
    state.typingLeaderboard = {};
    state.isFollowerInitialized = false;
    state.isClipInitialized = false;
    state.knownFollowerIds.clear();
    state.knownClipIds.clear();
    state.latestFollowTimestamp = null;
    state.latestClipTimestamp = null;
    state.todos = [];
    state.isTodoVisible = false;
  }

  // ------------------------------------------- Cron Jobs -------------------------------------------

  // Every 1 minute
  cron.schedule('* * * * *', async () => {
    if (state.isStreaming) await handleFollowUtility(client);
    if (state.isStreaming) runConversationUtility();
  }, { timezone });

  // Every 5 minutes
  cron.schedule('*/5 * * * *', () => {
    checkStreamAvailability();
  }, { timezone });

  // Every 10 minutes
  cron.schedule('*/10 * * * *', async () => {
    if (state.isStreaming) handleInformationUtility(client);
    await handleClipUtility();
  }, { timezone });

  // Every day 1 hour before stream start
  const streamStartHour = env.stream.startTime;
  const oneHourBeforeStream = (streamStartHour + 23) % 24;
  cron.schedule(`* ${oneHourBeforeStream} * * *`, () => {
    retryWhenOffline(() => {
      clearDailyStateCache();
      handleSetupUtility(client);
    });
  }, { timezone });
}

module.exports = handleCronUtility;
