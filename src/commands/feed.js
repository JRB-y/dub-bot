import { Interaction } from 'discord.js';
import { SlashCommandBuilder, blockQuote, codeBlock } from '@discordjs/builders';
import { User } from '../queries/index.js';
import moment from 'moment';

export default {
  data: new SlashCommandBuilder()
    .setName('feed')
    .setDescription('Feed your plants to harvest!')
    .addSubcommand(subcommand => {
      return subcommand
        .setName('cost')
        .setDescription('Each plant you have will cost 200 $dub')
      }
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('plant')
        .setDescription('Each plant you have will cost 200 $dub')
        .addStringOption((option) => {
          option.setName('slot').setDescription('Slot id to feed').setRequired(true);
          return option;
        })
    ),

  /**
   * Return information about the bot and current server.
   *
   * @param {Interaction} interaction
  */
  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();

    const user = await User.getByDiscord(interaction.user.id);
    if (!user) return interaction.reply({
      content: 'You are quite! \n Start talking to earn points...\n 1 word = 1 points',
      ephemeral: true,
    });
    if (!user.seeds.length) {
      await interaction.reply({
        content: codeBlock('diff', '- ⚠️ You have no seeds to feed! /shop to buy some!'),
        ephemeral: true,
      });
      return;
    }

    const now = moment();
    const feedable = [];
    const harvestable = [];
    for (const seed of user.seeds) {
      const canHarvest = seed.max_feed >= seed.feeds;
      const canFeed = moment(seed.last_feed).add(15, 'm').isBefore(now) && !canHarvest;

      if (canHarvest) {
        harvestable.push(seed);
      }
      if (canFeed) {
        feedable.push(seed);
      }
    }
    const feedTotalCost = feedable.length * 200;

    switch (subcommand) {
      /**
       * Feed cost subcommand
       */
      case 'cost':
        await interaction.reply({
          content: codeBlock('fix', `⚠️  You have ${feedable.length}/${user.seeds.length} feedable plant(s) \n    Feeding them will cost you ${feedTotalCost} $dub.`),
          ephemeral: true,
        });
        break;

      /**
       * Feed plant <slot> subcommand
       */
      case 'plant':
        if (user.dubs < 200) {
          await interaction.reply({
            content: codeBlock('diff', '- You dont have enough $dub to feed!'),
            ephemeral: true,
          });
          return;
        }

        const slotId = interaction.options.getString('slot');
        const seedToFeed = user.seeds.find(seed => seed._id.toString().endsWith(slotId));
        if (!seedToFeed) {
          await interaction.reply({
            content: codeBlock('fix', '⚠️  Invalid slot! \nCheck /inventory to find the 3 digit slot id.'),
            ephemeral: true,
          });
          return;
        }

        const nextFeed = moment(seedToFeed.last_feed).add(15, 'm');
        if (nextFeed.isAfter(now)) {
          await interaction.reply({
            content: codeBlock('fix', `⚠️  You cant feed this plant until ${nextFeed.format('yyyy-MM-DD HH:mm')}`),
            ephemeral: true,
          });
          return;
        }

        user.dubs = user.dubs - 200;
        seedToFeed.feeds += 1;
        seedToFeed.last_feed = now;
        await user.save();
        await interaction.reply({
          content: codeBlock('yaml', '💧 🌱You fed your plant 🌱💧'),
          ephemeral: true,
        });
      default:
        break;
    }
  },
};
