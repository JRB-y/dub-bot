import { Interaction } from 'discord.js';
import { SlashCommandBuilder, blockQuote, codeBlock, channelMention, roleMention } from '@discordjs/builders';
import moment from 'moment';


export default {
  data: new SlashCommandBuilder()
    .setName('work')
    .setDescription('Working in the cannabis industry!'),

  /**
   * Return information about the bot and current server.
   *
   * @param {Interaction} interaction
  */
  async execute(interaction, { user }) {
    /**
     * 1 - check if the message is comming from the process.env.WORK_CHANNEL.
     * 2 - check if the user has the role env.process.WORK_ROLE
     * 3 - if yes he can work!
     */
    if (interaction.channelId !== process.env.WORK_CHANNEL) {
      return interaction.reply({
        content: `You can only work in ${channelMention(process.env.WORK_CHANNEL)}`,
        ephemeral: true,
      });
    }

    // const hasWorkerRole = interaction.member._roles.find(r => r === process.env.WORK_ROLE_ID);
    // if (!hasWorkerRole) return interaction.reply({
    //   content: `You need ${roleMention(process.env.WORK_ROLE_ID)} role!\nGo to <#${process.env.WELCOME_CHANNEL}> and react to the pinned message to grant the role!`,
    //   ephemeral: true,
    // });

    // const random = Math.floor(Math.random() * (100 - 10 + 1)) + 10;
    // const dubEarned = ((random + 1) * 1) / 1000
    // console.log('dubEarned', (Number(dubEarned)).toFixed(2));

    let nextWork = null;
    if (user.last_work) {
      nextWork = moment(user.last_work).add(30, 'm');
      if (nextWork.isAfter(moment())) {
        return interaction.reply({
          content: codeBlock('fix', `You are currently working come back at ${nextWork.format('YYYY-MM-DD HH:mm')} to collect your $dub!`),
          ephemeral: true,
        })
      } else if (nextWork.isBefore(moment())) {
        const random = Math.random();
        // const dubEarned = Number((random * user.level + 1) / 100);
        user.last_work = moment().add(30, 'm');
        user.worked = user.worked + 1;
        user.dubs = Number(Number(user.dubs) + random).toFixed(2);
        await user.save();

        return interaction.reply({
          content: codeBlock('yaml', `You have earned ${Number(random).toFixed(2) } $dub.\nYou start working in the coffee-shop get back in 30 minutes.`),
          // ephemeral: true,
        })
      }
    }

    nextWork = moment().add(30, 'm');
    user.last_work = moment();
    user.worked = user.worked ? user.worked + 1 : 1;
    await user.save();

    // need to caculate the $dub earned!
    return interaction.reply({
      content: codeBlock('yaml', `You start working in the coffee-shop get back in 30 minutes to collect your $dub`),
      // ephemeral: true,
    })


 
    // console.log('user', user);
    // console.log(interaction.member._roles);
    // console.log('interaction.guild.members', interaction.guild.members.get(user.discord_id))
    // console.log('u', interaction.guild.members.cache.get(user.discord_id));
  },
};
