import { Interaction } from 'discord.js';
import { SlashCommandBuilder, codeBlock } from '@discordjs/builders';

import moment from 'moment';
import { User } from '../queries/index.js';
import { Models } from '../db/index.js';

export default {
  data: new SlashCommandBuilder()
    .setName('inventory')
    .setDescription('Your inventory!'),

  /**
   * Display user inventary.
   * Include seeds
   *
   * @param {Interaction} interaction
  */
  async execute(interaction) {
    const now = moment();
    const queries = [User.getByDiscord(interaction.user.id), Models.Seed.find()];
    const [user, seeds] = await Promise.all(queries);

    if (!user) return interaction.reply('You are quite! \n Start talking to earn points...\n 1 word = 1 points');

    let message = `$dub: ${user.dubs}\nlevel: ${user.level}\nslots: ${user.seeds.length} / ${user.max_seeds}\n------------------------------\n\nYou have ${user .seeds.length} plant(s):\n\n`;

    const userSeeds = user.seeds.map(seed => {
      const foundSeed = seeds.find(s => s._id.toString() === seed.id.toString());
      const feeds = seed.feeds.toLocaleString('en-US', { minimumIntegerDigits: 2, useGrouping: false });
      const growth = foundSeed.grow_feeds.toLocaleString('en-US', { minimumIntegerDigits: 2, useGrouping: false });
      const slotId = seed._id.toString().substr(seed._id.toString().length - 3);
      let message = `${slotId} - ${feeds} / ${growth} - ${foundSeed.name}`;
      const nextFeed = moment(seed.last_feed).add(15, 'm');
      if (seed.feeds >= seed.max_feeds) {
        message = `🌱 ${message} (harvestable) \n`;
      } else if (nextFeed.isBefore(moment())) {
        message = `💧 ${message} (feedable) \n`;
      } else {
        message = `🕧 ${message} (feedable at ${nextFeed.format('yyyy-MM-DD HH:mm')}) \n`;
      }
      return message;
    });

    message.concat(userSeeds.join('\n'));
    await interaction.reply({
      content: codeBlock('yaml', message + userSeeds.join('\n')),
      ephemeral: true,
    });
  },
};
