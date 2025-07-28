const handleRaidUtility = require('@twitch/utilities/raid');

async function handleRaidCommand(client, user, isBroadcaster) {
  await handleRaidUtility(client, user, isBroadcaster);
}

module.exports = handleRaidCommand;
