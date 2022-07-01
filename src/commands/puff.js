import { Interaction } from 'discord.js';
import { SlashCommandBuilder, userMention } from '@discordjs/builders';


export default {
  data: new SlashCommandBuilder()
    .setName('puff')
    .setDescription('Puff puff pass!'),

  /**
   * Return information about the bot and current server.
   *
   * @param {Interaction} interaction
  */
  async execute(interaction, { user }) {
    const isStaff = interaction.member._roles.find(r => r === process.env.ROLE_STAFF)
    if (!isStaff) {
      return interaction.reply({
        content: 'Only staff members can make this command',
        ephemeral: true,
      });
    }

    const message = await interaction.client.channels.cache.get(process.env.SMOKE_CHANNEL).send({
      content: `@everyone First to react get the dub 💨`,
    });

    const filter = (reaction, user) => {
      //  && user.id === interaction.user.id
      return ['💨'].includes(reaction.emoji.name);
    };

    message.awaitReactions({ filter, max: 1, time: 60000, errors: ['time'] })
      .then(async collected => {
        const reaction = collected.first();
        const [reactedUser] = await reaction.users.fetch();

        if (reaction.emoji.name === '💨') {
          const random = Number(Math.random()).toFixed(2);
          user.dubs = Number(Number(user.dubs) + Number(random)).toFixed(2);
          await user.save();

          message.reply({
            content: `Yo ${userMention(reactedUser[1].id)} take the joint and ${random} dub.`
          })
        }
      })
      .catch(collected => {
        console.log('Error while waiting the reaction to the join!', collected);
      });
  },
};
