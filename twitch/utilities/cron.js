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
  // ------------------------------------------- Functions -------------------------------------------

  // isStreaming Utility
  async function checkStreamAvailability() {
    try {
      state.isStreaming = await handleIsStreamingUtility();
    } catch (error) {
      console.error("Error checking stream availability:", error.message);
    }
  }

  // Conversation Utility
  async function runConversationUtility() {
    const now = Date.now();
    const fiveMinutes = 5 * 60 * 1000;

    if (now - state.lastMessageTimestamp >= fiveMinutes) {
      client.say(`#${env.twitch.channel.username}`, `💭 ${await handleTopicCommand()}`);
      state.lastMessageTimestamp = now;
    }
  }

  // follow Utility
  function checkNewFollowers() {
    const username = env.twitch.channel.username;
    handleFollowUtility(newFollower => client.say(`#${username}`, `${newFollower} just followed!`));
  }

  // ------------------------------------------- Cron Jobs -------------------------------------------

  // Every 1 minute
  cron.schedule('* * * * *', () => {
    handleSetupUtility(client);
    if (state.isStreaming) checkNewFollowers();
    if (state.isStreaming) runConversationUtility();
  });

  // Every 5 minutes
  cron.schedule('*/5 * * * *', () => {
    checkStreamAvailability();
  });

  // Every 10 minutes
  cron.schedule('*/10 * * * *', () => {
    if (state.isStreaming) handleInformationUtility(client);
  });
}

module.exports = handleCronUtility;
