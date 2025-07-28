const sendToDiscordUtility = require('@twitch/utilities/sendToDiscord');
const env = require('@config/environments/base');

async function handleLinkUtility(user, client, message) {
  const urlRegex = /https?:\/\/[^\s/$.?#].[^\s]*/gi;
  const links = message.match(urlRegex);

  if (links) {
    await sendToDiscordUtility(user, message, env.discord.webhook.link),
    client.say(`#${env.twitch.channel.username}`, "📝 Link saved to Discord (http://discord.boseriko.com)!");
  }
}

module.exports = handleLinkUtility;
