const sendToDiscordUtility = require('@twitch/utilities/sendToDiscord');

const exemptDomains = [
  "open.spotify.com", // This avoid conflicts with Controller.Music.add_to_queue
];

async function handleLinkUtility(user, client, message) {
  const urlRegex = /https?:\/\/[^\s/$.?#].[^\s]*/gi;
  const links = message.match(urlRegex);

  if (!links) return;
  if (links.some(link => exemptDomains.some(domain => link.includes(domain)))) return;

  await sendToDiscordUtility(user, message, Config.discord.webhook.link);
  client.say(`#${Config.twitch.channel.username}`, "📝 Link saved to Discord (http://discord.boseriko.com)!");
}

module.exports = handleLinkUtility;
