import { Interaction } from 'discord.js';
import { SlashCommandBuilder, blockQuote, codeBlock } from '@discordjs/builders';

import { User } from '../queries/index.js';

export default {
  data: new SlashCommandBuilder()
    .setName('leaderboard')
    .setDescription('Top cultivator in the community!'),

  /**
   * Return information about the bot and current server.
   *
   * @param {Interaction} interaction
  */
  async execute(interaction) {
    const topUsers = await User.getTop(20);
    let message = `🏆 Leaderboard \n`;
    let i = 0;
    for (let user of topUsers) {
      i++;
      message += `${i} - ${user.discord_username} - ${user.dubs} $dub \n`;
    } 
    // get top users by dubs
    await interaction.reply(codeBlock('yaml', message));
  },
};
