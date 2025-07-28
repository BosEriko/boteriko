const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require('discord.js');
const commandConstant = require('@global/constants/command');
const handleErrorUtility = require('@global/utilities/error');

const COMMANDS_PER_PAGE = 10;

function buildCommandEmbed(commands, page = 0) {
  const start = page * COMMANDS_PER_PAGE;
  const end = start + COMMANDS_PER_PAGE;
  const sliced = commands.slice(start, end);

  const lines = sliced.map(cmd => {
    const accessIcon = cmd.restricted ? '👑' : '👥';
    const platformIcons = cmd.availability
      .map(p => p === 'Discord' ? '🟦' : p === 'Twitch' ? '🟪' : '')
      .join(' ');

    const name = `${accessIcon} **!${cmd.command}${cmd.parameter ? ' [param]' : ''}** ${platformIcons}`;
    const desc = cmd.description;

    return `${name}\n${desc}`;
  });

  // Add footer legend
  lines.push('**Icons Legend:** \n👑 Admin Only   👥 Everyone   🟦 Discord   🟪 Twitch');

  return new EmbedBuilder()
    .setTitle(`📜 Available Commands (Page ${page + 1}/${Math.ceil(commands.length / COMMANDS_PER_PAGE)})`)
    .setDescription(lines.join('\n\n'))
    .setColor('#00BFFF');
}

async function handleListCommand(message) {
  try {
    let currentPage = 0;
    const totalPages = Math.ceil(commandConstant.length / COMMANDS_PER_PAGE);

    const embed = buildCommandEmbed(commandConstant, currentPage);
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('prev')
        .setLabel('⬅ Previous')
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(true),
      new ButtonBuilder()
        .setCustomId('next')
        .setLabel('Next ➡')
        .setStyle(ButtonStyle.Primary)
        .setDisabled(totalPages <= 1)
    );

    const sentMessage = await message.reply({ embeds: [embed], components: [row] });

    const collector = sentMessage.createMessageComponentCollector({
      componentType: ComponentType.Button,
      time: 10 * 60 * 1000,
    });

    collector.on('collect', async interaction => {
      if (!interaction.isButton()) return;
      if (interaction.user.id !== message.author.id) {
        return interaction.reply({ content: "⛔ Only the command sender can interact with this menu.", ephemeral: true });
      }

      interaction.deferUpdate();

      if (interaction.customId === 'next') currentPage++;
      if (interaction.customId === 'prev') currentPage--;

      const newEmbed = buildCommandEmbed(commandConstant, currentPage);
      const newRow = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('prev')
          .setLabel('⬅ Previous')
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(currentPage === 0),
        new ButtonBuilder()
          .setCustomId('next')
          .setLabel('Next ➡')
          .setStyle(ButtonStyle.Primary)
          .setDisabled(currentPage >= totalPages - 1)
      );

      await sentMessage.edit({ embeds: [newEmbed], components: [newRow] });
    });

    collector.on('end', async () => {
      await sentMessage.edit({ components: [] });
    });
  } catch (err) {
    await handleErrorUtility('❌ handleListCommand error:', err);
  }
}

module.exports = handleListCommand;
