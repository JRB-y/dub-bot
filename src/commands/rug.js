import { Interaction, MessageEmbed } from 'discord.js';
import { SlashCommandBuilder, blockQuote, codeBlock, userMention, bold } from '@discordjs/builders';
import { User } from '../queries/index.js';
import { Models } from '../db/index.js';

export default {
  data: new SlashCommandBuilder()
    .setName('rug')
    .setDescription('Rug a dub!!')
    .addUserOption(option => option.setName('user').setDescription('mention a bud to rug') ),

  /**
   * Return information about the bot and current server.
   *
   * @param {Interaction} interaction
  */
  async execute(interaction, { user }) {
    if (interaction.channel.id !== process.env.THE_HOOD_CHANNEL) {
      return interaction.reply({
        content: `⚠️ You can rug only in <#${process.env.THE_HOOD_CHANNEL}>`,
        ephemeral: true,
      });
    }

    let userToRug = interaction.options.get('user');
    userToRug = userToRug.user;
    if (!userToRug) {
      return interaction.reply({
        content: codeBlock('fix', `⚠️ You need to mention a user to rug!`),
        ephemeral: true,
      });
    }
    if (userToRug.bot) {
      return interaction.reply({
        content: codeBlock('fix', `⚠️ You can't rug a bot!`),
        ephemeral: true,
      });
    }
    if (userToRug.id === interaction.user.id) {
      return interaction.reply({
        content: codeBlock('fix', `⚠️ You can't rug yourself!`),
        ephemeral: true,
      });
    }
  
    const userToRugModel = await User.getByDiscord(userToRug.id);
    if (userToRugModel.dubs < 0.5) {
      return interaction.reply({
        content: codeBlock('fix', `⚠️ You can't rug a bud with less than 0.5 dub!`),
        ephemeral: true,
      });
    }

    let Rug = await Models.Rugs.findOne({ from: user._id.toString(), isFinished: false });
    if (Rug) {
      return interaction.reply({
        content: codeBlock('fix', `⚠️ You have a planned rug you can only plan 1 rug at a time!`),
        ephemeral: true,
      });
    } else {
      Rug = await Models.Rugs.create({ from: user._id.toString(), to: userToRugModel._id.toString(), })
    }

    const embed = new MessageEmbed()
      .setTitle(`😱 A RUG IS PLANNED`)
      .setColor('#EE730C')
      .setDescription(`${userMention(interaction.user.id)} wants to rug ${userMention(userToRug.id)}!

        ${userMention(userToRug.id)} you have 3 minutes to react with :crossed_swords: to defend your dub!
      `);
  
    const message = await interaction.client.channels.cache.get(process.env.THE_HOOD_CHANNEL).send({
      embeds: [embed],
    });

    const filter = (reaction, user) => {
      return user.id === userToRug.id && reaction.emoji.name === '⚔️';
    };

    message.awaitReactions({ filter, max: 1, time: process.env.RUG_DELAY, errors: ['time'] })
      .then(async collected => {
        const reaction = collected.first();
        if (reaction.emoji.name === '⚔️') {
          const embed = new MessageEmbed()
            .setTitle(`🛡️ Nice defense!`)
            .setColor('#3BEE0C')
            .setDescription(`${userMention(userToRug.id)} defended successfully against ${userMention(interaction.user.id)}`);

          await Models.Rugs.findOneAndUpdate({ from: user._id.toString(), isFinished: false }, { isFinished: true, win: false })
          await interaction.client.channels.cache.get(process.env.THE_HOOD_CHANNEL).send({
            embeds: [embed]
          });

          await message.delete();
        }
      })
      .catch(async () => {
        const userRugged = await User.getByDiscord(userToRug.id);
        const random = (Math.random() * (userRugged.dubs - 0.1) + 0.1) / 3;

        userRugged.dubs = userRugged.dubs - random <= 0 ? 0 : Number(userRugged.dubs - random).toFixed(2);
        await userRugged.save();
        user.dubs = Number(Number(user.dubs) + Number(random)).toFixed(2);
        await user.save();

        // NO REACTION AFTER 5 minutes
        const embed = new MessageEmbed()
          .setTitle(`💀 ${userToRug.username} get RUGGED!`)
          .setColor('#FF0000')
          .setDescription(`${userMention(userToRug.id)} was rugged by ${userMention(interaction.user.id)} for ${random.toFixed(2)} $dub!`);

        await Models.Rugs.findOneAndUpdate({ from: user._id.toString(), isFinished: false }, { isFinished: true, win: true, dubs: random.toFixed(2) })
        await interaction.client.channels.cache.get(process.env.THE_HOOD_CHANNEL).send({
          embeds: [embed],
        });
        await message.delete();
      });

    return interaction.reply({
      content: codeBlock('fix', 'Your rug is planned, you can only rug 1 bud at time!'),
      ephemeral: true
    });
  },
};
