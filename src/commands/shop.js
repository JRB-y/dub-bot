import { codeBlock, SlashCommandBuilder } from '@discordjs/builders';
import { Interaction } from 'discord.js';
import { quote } from '@discordjs/builders';
import { Seeds } from '../config/index.js';
import { Models } from '../db/index.js';
import { User } from '../queries/index.js';
import moment from 'moment';

const formatedSeeds = Seeds.map(seed => {
  return {
    name: `${seed.price} $dub - ${seed.name} (${seed.grow_feeds} feeds)`,
    value: seed.name,
  }
});

export default {
  data: new SlashCommandBuilder()
    .setName('shop')
    .setDescription('Buy items!')
    .addSubcommand(subcommand =>
      subcommand
        .setName('seeds')
        .setDescription('List of seeds to buy')
        .addStringOption( (option) => {
          option.setName('seed').setDescription('Select the desired seed').setRequired(true);
          for (const seed of formatedSeeds) {
            option.addChoices({ name: seed.name, value: seed.value });
          }
          return option;
        })
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('boosters')
        .setDescription('List of booster to buy')
        .addStringOption(option => {
          option.setName('booster').setDescription('Specify the Equipment').setRequired(true);
          option.addChoices({ name: 'water', value: 'water' });
          return option;
        })
    ),

  /**
  * @param {Interaction} interaction
  */
  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();

    switch (subcommand) {
      case 'seeds':
        const seedToBuy = await Models.Seed.findOne({ name: interaction.options.getString('seed') });

        // const seedToBuy = Seeds.find(s => s.name === interaction.options.getString('seed'));
        if (!seedToBuy) {
          await interaction.reply(codeBlock('diff', '- Invalid seed! What are you trying to do? :) '));
          return;
        }

        const user = await User.getByDiscord(interaction.user.id);
        // if user dont exists or dont have points
        if (!user) return interaction.reply('You are quite! \n Start talking to earn $dub...\n 1 word = 1 $dub');

        // If user has already this seed
        // if (user.seeds.map(seed => seed.seedId).includes(seedToBuy.id)) {
        //   await interaction.reply(codeBlock('css', 'You already have this seed'));
        //   return;
        // }

        // check for empty slot
        if (user.max_seeds <= user.seeds.length) {
          await interaction.reply(codeBlock('fix', 'You have no more slots!'));
          return;
        }
        // if user dont have enough points
        if (user.dubs < seedToBuy.price) {
          await interaction.reply(codeBlock('diff', `- You don't have enough $dub to buy this seed!`));
          return;
        }

        // we gonna buy here!
        user.seeds.push({ id: seedToBuy.id, feeds: 0, max_feeds: seedToBuy.grow_feeds, last_feed: null, grow_feeds: seedToBuy.grow_feeds, last_feed: moment().subtract(15, 'm') });
        user.dubs = user.dubs - seedToBuy.price;
        await user.save();

        await interaction.reply(codeBlock('diff', `+ 🌱 You have bought '${seedToBuy.name}' for ${seedToBuy.price} $dub`));
        break;
      case 'booster':
        await interaction.reply(codeBlock('css', 'Boosters are coming soon'));
        return;
        break;
    
      default:
        await interaction.reply(codeBlock('css', 'This shop is not available, open a request!'));
        break;
    }

  },
};
