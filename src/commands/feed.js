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
    if (!user.seeds.length) {
      await interaction.reply(codeBlock('diff', '- ⚠️ You have no seeds to feed! /shop to buy some!'));
      return;
    }

    const now = moment();
    const feedable = user.seeds.filter(seed => moment(seed.last_feed).add(15, 'm').isBefore(now));
    const feedTotalCost = feedable.length * 200;

    switch (subcommand) {
      case 'cost':
        await interaction.reply(codeBlock('fix', `⚠️  You have ${feedable.length}/${user.seeds.length} feedable plant(s) \n    Feeding them will cost you ${feedTotalCost} $dub.`));
        break;
      case 'plant':
        
        if (user.dubs < 200) {
          await interaction.reply(codeBlock('diff', '- You dont have enough $dub to feed!'));
          return;
        }

        const slotId = interaction.options.getString('slot');
        const seedToFeed = user.seeds.find(seed => seed._id.toString().includes(slotId));
        if (!seedToFeed) {
          await interaction.reply(codeBlock('fix', '⚠️  Invalid slot! \nCheck /inventory to find the 3 digit slot id.'));
          return;
        }

        const nextFeed = moment(seedToFeed.last_feed).add(15, 'm');
        if (nextFeed.isAfter(now)) {
          await interaction.reply(codeBlock('fix', `⚠️  You cant feed this plant until ${nextFeed.format('yyyy-MM-DD HH:mm')}`));
          return;
        }

        user.dubs = user.dubs - 200;
        seedToFeed.feeds += 1;
        seedToFeed.last_feed = now;
        // user.seeds = [...user.seeds, seedToFeed ];
        await user.save();
        await interaction.reply(codeBlock('yaml', '🌱💧 You fed your plant 🌱💧'));
      default:
        break;
    }
  },
};
