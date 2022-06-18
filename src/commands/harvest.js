import { Interaction } from 'discord.js';
import { SlashCommandBuilder, codeBlock } from '@discordjs/builders';

import { User, Seed } from '../queries/index.js';
import { Seeds } from '../config/seeds.js';

export default {
  data: new SlashCommandBuilder()
    .setName('harvest')
    .setDescription('Harvest a plant to get $weed')
    .addStringOption((option) => {
      option.setName('slot').setDescription('Slot id to harvest').setRequired(true);
      return option;
    }),

  /**
   * Return information about the bot and current server.
   *
   * @param {Interaction} interaction
  */
  async execute(interaction) {
    const user = await User.getByDiscord(interaction.user.id);
    if (!user) return interaction.reply('You are quite! \n Start talking to earn points...\n 1 word = 1 points');
    if (!user.seeds.length)interaction.reply(codeBlock('diff', '- ⚠️ You have no plants to feed! /shop to buy some!'));

    const slotId = interaction.options.getString('slot');
    const seedToHarvest = user.seeds.find(seed => seed._id.toString().endsWith(slotId));
    if (!seedToHarvest) {
      return interaction.reply(codeBlock('fix', `⚠️ You don't have a slot with this is id ${slotId}!`));
    }
    if (seedToHarvest.feeds < seedToHarvest.max_feeds) {
      return interaction.reply(codeBlock('fix', `⚠️ This plant cant be harvested! ${seedToHarvest.feeds}/${seedToHarvest.max_feeds} feeds done!`));
    }

    console.log('seedToHarvest._id', seedToHarvest.id.toString());
    // get the seed from db
    const seedDB = await Seed.findById(seedToHarvest.id.toString());
    console.log('seedDB', seedDB);

    user.weed = Array.isArray(user.weed) ? 0 : user.weed;
    user.weed = (user.weed || 0) + seedDB.havest;

    user.seedHarvested = (user.seedHarvested || 0) + 1;
    user.seeds = user.seeds.filter(seed => seed.id.toString() !== seedDB._id.toString());
    await user.save();

    await interaction.reply({
      content: codeBlock('bash', `🎉 Congratulations! You earned: ${seedDB.havest} $weed!`),
      ephemeral: true,
    });
  },
};
