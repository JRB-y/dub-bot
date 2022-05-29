import { Interaction } from 'discord.js';
import { SlashCommandBuilder, blockQuote, codeBlock } from '@discordjs/builders';


export default {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Bot and server health!'),

  /**
   * Return information about the bot and current server.
   *
   * @param {Interaction} interaction
  */
  async execute(interaction) {
    const message = ` Server name: ${interaction.guild.name}\n Total members: ${interaction.guild.memberCount} \n verificationLevel: ${interaction.guild.verificationLevel}`;

    await interaction.reply(codeBlock('fix', message));
  },
};
