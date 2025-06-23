const cron = require('node-cron');
const env = require('@global/utilities/env');

// Utilities
const handleIsStreamingUtility = require("@global/utilities/isStreaming");
const handleInformationUtility = require('@twitch/utilities/information');
const handleFollowUtility = require('@twitch/utilities/follow');
const handleSetupUtility = require('@twitch/utilities/setup');

let isStreaming = false;
let lastMessageTimestamp = Date.now();

function handleCronUtility(client) {
    // ------------------------------------------- Functions -------------------------------------------
    
    // isStreaming Utility
    async function checkStreamAvailability() {
        try {
            isStreaming = await handleIsStreamingUtility();
        } catch (error) {
            console.error("Error checking stream availability:", error.message);
        }
    }
    
    // Conversation Utility
    async function runConversationUtility() {
        const now = Date.now();
        const fiveMinutes = 5 * 60 * 1000;
        
        if (now - lastMessageTimestamp >= fiveMinutes) {
            client.say(`#${env.twitch.channel.username}`, `💭 ${await handleTopicCommand()}`);
            lastMessageTimestamp = now;
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
        if (isStreaming) checkNewFollowers();
        if (isStreaming) runConversationUtility();
    });
    
    // Every 5 minutes
    cron.schedule('*/5 * * * *', () => {
        checkStreamAvailability();
    });
    
    // Every 10 minutes
    cron.schedule('*/10 * * * *', () => {
        if (isStreaming) handleInformationUtility(client);
    });
}

module.exports = handleCronUtility;