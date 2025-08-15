const sendToDiscordUtility = require('@twitch/utilities/sendToDiscord');

async function handleLinkUtility(user, client, message) {
  const urlRegex = /https?:\/\/[^\s/$.?#].[^\s]*/gi;
  const links = message.match(urlRegex);

  if (!links) return;

  await sendToDiscordUtility(user, message, Config.discord.webhook.link);
  client.say(`#${Config.twitch.channel.username}`, "📝 Link saved to Discord (http://discord.boseriko.com)!");
}

module.exports = handleLinkUtility;
