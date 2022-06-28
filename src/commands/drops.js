import { Interaction } from 'discord.js';
import { blockQuote, codeBlock, SlashCommandBuilder } from '@discordjs/builders';
import { MessageEmbed } from 'discord.js';

import moment from 'moment';
import fetch from 'node-fetch';

export default {
  data: new SlashCommandBuilder()
    .setName('drops')
    .setDescription('Show drops of the day!'),

  /**
   * Return information about the bot and current server.
   *
   * @param {Interaction} interaction
   */
  async execute(interaction) {
    if (interaction.channel.id !== process.env.DROPS_CHANNEL) {
      return interaction.reply({
        content: `⚠️ This command can be used only in <#${process.env.DROPS_CHANNEL}>`,
        ephemeral: true,
      });
    }

    const response = await fetch('https://api.howrare.is/v0.1/drops');
    const result = await response.json();
    let { data } = result.result;
    const today = moment().format('YYYY-MM-DD');
    let embeds = [];
    let count = 0;
    for (const d of data[today]) {
      embeds.push(
        new MessageEmbed()
          .setColor('#0099ff')
          .setTitle(`${d.name}`)
          .setURL(d.website)
          .setAuthor({ name: `At ${d.time} (${d.nft_count} nft) (price: ${d.price})` })
          .setDescription(d.extra ? d.extra : '--')
          .setThumbnail(`${d.image}`)
          // .addFields(
          //   { name: 'Price', value: d.price, inline: true },
          //   { name: 'Discord', value: d.discord, inline: true },
          // )
      )
      count ++;
      if (count >= 10) {
        interaction.channel.send({ embeds: embeds });
        embeds = [];
      }
    }
    if (embeds.length) {
      interaction.channel.send({ embeds: embeds });
    }
    return interaction.reply({ content: codeBlock('fix', 'DROPS: Not a financial advice DYOR!!'), ephemeral: true });

  },
};
