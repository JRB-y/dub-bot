import { Interaction } from 'discord.js';
import { SlashCommandBuilder, blockQuote, codeBlock } from '@discordjs/builders';
import { MessageEmbed } from 'discord.js';
import fetch from 'node-fetch';

export default {
  data: new SlashCommandBuilder()
    .setName('top')
    .setDescription('Top NFT Collections!')
    .addSubcommand(subcommand => {
      return subcommand
        .setName('floor')
        .setDescription('Top Movers in Floor Price (Past 24 hours)')
    }
    ),
  /**
   * Return information about the bot and current server.
   *
   * @param {Interaction} interaction
  */
  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();
    if (interaction.channel.id !== process.env.TOOLS_CHANNEL) {
      return interaction.reply({
        content: `⚠️ This command can be used only in <#${process.env.TOOLS_CHANNEL}>`,
        ephemeral: true,
      });
    }

    switch (subcommand) {
      case 'floor':

        const response = await fetch('https://sols.watch/api/top-floor.json');
        const data = await response.json();

        let embeds = [];
        let count = 0;
        for (const collection of data[0]) {
          embeds.push(
            new MessageEmbed()
              .setColor('#0099ff')
              .setTitle(collection.name)
              .setThumbnail(collection.image_url)
              .addFields(
                { name: 'Floor change 24h', value: `↑ ${collection.floor_change}%` },
                { name: '\u200B', value: '\u200B' },
                { name: 'Floor price', value: `${collection.floor_price} ◎`, inline: true },
                { name: 'Daily volume', value: `${collection.daily_volume} ◎`, inline: true },
                { name: '\u200B', value: '\u200B' },
                { name: 'Magic Eden', value: collection.magiceden ? collection.magiceden : '--', inline: true },
                { name: 'Solanart', value: collection.solanart ? collection.solanart : '--', inline: true },
                { name: 'Open Sea', value: collection.opensea ? collection.opensea : '--', inline: true },
                { name: 'Digital Eyes', value: collection.digitaleyes ? collection.digitaleyes : '--', inline: true },
              )
          )
          count++;
          if (count >= 10) {
            interaction.channel.send({ embeds: embeds });
            embeds = [];
          }
        }
        if (embeds.length) {
          interaction.channel.send({ embeds: embeds })
        }
        interaction.reply({ content: blockQuote('fix', 'TOP FLOOR: Not a financial advice DYOR!!'), ephemeral: true });
        break;

      default:
        break;
    }
  },
};
