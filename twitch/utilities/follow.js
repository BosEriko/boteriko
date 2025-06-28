const { ApiClient } = require('@twurple/api');
const { EventSubWsListener } = require('@twurple/eventsub-ws');
const { StaticAuthProvider } = require('@twurple/auth');
const env = require('@global/utilities/env');
const { broadcastToClient } = require('@global/utilities/websocket');

const authProvider = new StaticAuthProvider(env.twitch.bot.clientId, env.twitch.bot.accessToken);
const apiClient = new ApiClient({ authProvider });
const listener = new EventSubWsListener({ apiClient });

async function handleFollowUtility(client) {
  await listener.start();
  await listener.onChannelFollow(env.twitch.channel.id, async (event) => {
    const username = event.userDisplayName;
    const message = `${username} just followed!`;

    broadcastToClient({ type: 'NOTIFICATION', event_type: 'follow', message });
    client.say(`#${env.twitch.channel.username}`, message);
  });
}

module.exports = handleFollowUtility;
