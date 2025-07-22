const { EmbedBuilder } = require('discord.js');
const commandConstant = require('@global/constants/command');
const env = require('@global/utilities/env');
const handleErrorUtility = require('@global/utilities/error');

function buildCommandEmbed(commands) {
  const lines = commands.map(cmd => {
    const accessIcon = cmd.restricted ? '👑' : '👥';
    const platformIcons = cmd.availability
      .map(p => p === 'Discord' ? '🟦' : p === 'Twitch' ? '🟪' : '')
      .join(' ');

    const name = `${accessIcon} **!${cmd.command}${cmd.parameter ? ' [param]' : ''}** ${platformIcons}`;
    const desc = cmd.description;

    return `${name}\n${desc}`;
  });

  // Legend footer
  lines.push('\n👑 Admin Only   👥 Everyone   🟦 Discord   🟪 Twitch');

  const embed = new EmbedBuilder()
    .setTitle('📜 Available Commands')
    .setDescription(lines.join('\n\n'))
    .setColor('#00BFFF');

  return embed;
}

async function handleCommandUtility(client) {
  const channelId = env.discord.channel.command;

  try {
    const channel = await client.channels.fetch(channelId);
    const messages = await channel.messages.fetch({ limit: 1 });

    const embed = buildCommandEmbed(commandConstant);

    if (messages.size === 0) {
      await channel.send({ embeds: [embed] });
      console.log('📬 Sent new command list message.');
    } else {
      const lastMessage = messages.first();
      await lastMessage.edit({ embeds: [embed] });
      console.log('✏️ Edited existing command list message.');
    }
  } catch (err) {
    await handleErrorUtility('❌ handleCommandUtility error:', err);
  }
}

module.exports = handleCommandUtility;
