const { EmbedBuilder } = require('discord.js');
const commandConstant = require('@global/constants/command');
const env = require('@global/utilities/env');
const handleErrorUtility = require('@global/utilities/error');

const PLATFORM_DISCORD = 'Discord';
const PLATFORM_TWITCH = 'Twitch';

function buildCommandEmbeds(commands) {
  const embeds = [];
  const chunkSize = 10;

  for (let i = 0; i < commands.length; i += chunkSize) {
    const chunk = commands.slice(i, i + chunkSize);
    const embed = new EmbedBuilder()
      .setTitle('📜 Available Commands')
      .setColor('#FFD700');

    chunk.forEach(cmd => {
      const name = `!${cmd.command} ${cmd.parameter ? '[param]' : ''}`;
      const availability = [
        cmd.availability.includes(PLATFORM_DISCORD) ? '🟦 Discord' : '',
        cmd.availability.includes(PLATFORM_TWITCH) ? '🟪 Twitch' : ''
      ].filter(Boolean).join(' + ');

      const desc = [
        cmd.description,
        availability,
        cmd.restricted ? '🔒 Restricted' : ''
      ].filter(Boolean).join('\n');

      embed.addFields({ name, value: desc, inline: false });
    });

    embeds.push(embed);
  }

  return embeds;
}

async function handleCommandUtility(client) {
  const channelId = env.discord.channel.command;

  try {
    const channel = await client.channels.fetch(channelId);
    const messages = await channel.messages.fetch({ limit: 1 });

    const embeds = buildCommandEmbeds(commandConstant);

    if (messages.size === 0) {
      await channel.send({ embeds });
      console.log('📬 Sent new command list message.');
    } else {
      const lastMessage = messages.first();
      await lastMessage.edit({ embeds });
      console.log('✏️ Edited existing command list message.');
    }
  } catch (err) {
    await handleErrorUtility('❌ handleCommandUtility error:', err);
  }
}

module.exports = handleCommandUtility;
