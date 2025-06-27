const cron = require('node-cron');
const env = require('@global/utilities/env');
const state = require('@global/utilities/state');

// Utilities
const handleIsStreamingUtility = require("@global/utilities/isStreaming");
const handleInformationUtility = require('@twitch/utilities/information');
const handleFollowUtility = require('@twitch/utilities/follow');
const handleSetupUtility = require('@twitch/utilities/setup');
const handleTopicCommand = require('@global/commands/topic');

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
      client.say(`#${env.twitch.channel.username}`, `💭 ${await handleTopicCommand()}`);
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

  // ------------------------------------------- Cron Jobs -------------------------------------------

  // Every 1 minute
  cron.schedule('* * * * *', () => {
    if (state.isStreaming) handleFollowUtility(client);
    if (state.isStreaming) runConversationUtility();
  }, { timezone });

  // Every 5 minutes
  cron.schedule('*/5 * * * *', () => {
    checkStreamAvailability();
  }, { timezone });

  // Every 10 minutes
  cron.schedule('*/10 * * * *', () => {
    if (state.isStreaming) handleInformationUtility(client);
  }, { timezone });

  // Every day at midnight
  cron.schedule('0 0 * * *', () => {
    retryWhenOffline(() => {
      state.typingLeaderboard = {};
      handleSetupUtility(client);
    });
  }, { timezone });
}

module.exports = handleCronUtility;
