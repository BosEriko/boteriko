const commandConstant = require('@global/constants/command');
const env = require('@global/utilities/env');
const handleErrorUtility = require('@global/utilities/error');

function formatCommandTable(commands) {
  const header = [
    '| Command | Param | Discord | Twitch | Restricted | Description |',
    '|---------|-------|---------|--------|------------|-------------|',
  ];

  const rows = commands.map(cmd => {
    const param = cmd.parameter ? '✅' : '';
    const discord = cmd.availability.includes('Discord') ? '✅' : '';
    const twitch = cmd.availability.includes('Twitch') ? '✅' : '';
    const restricted = cmd.restricted ? '🔒' : '';
    return `| \`!${cmd.command}\` | ${param} | ${discord} | ${twitch} | ${restricted} | ${cmd.description} |`;
  });

  return ['**📜 Available Commands**\n\n', ...header, ...rows].join('\n');
}

async function handleCommandUtility(client) {
  const channelId = env.discord.channel.command;

  try {
    const channel = await client.channels.fetch(channelId);
    const messages = await channel.messages.fetch({ limit: 10 });

    const botMessage = messages.find(msg => msg.author?.id === client.user.id && !msg.system);
    const content = formatCommandTable(commandConstant);

    if (botMessage) {
      await botMessage.edit(content);
      console.log('✅ Updated command list message.');
    } else {
      await channel.send(content);
      console.log('📬 Sent new command list message.');
    }
  } catch (err) {
    handleErrorUtility('❌ handleCommandUtility error:', err);
  }
}

module.exports = handleCommandUtility;
