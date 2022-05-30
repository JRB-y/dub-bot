import 'dotenv/config';
import fs from 'fs';
import path from 'path';
// es module __dirname
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import db from './db.js';
import { User } from './queries/index.js';
import { Levels } from './config/index.js';

import { Client, Collection, Intents } from 'discord.js';
import { codeBlock } from '@discordjs/builders';
const client = new Client({
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MESSAGE_REACTIONS],
  partials: ['MESSAGE', 'CHANNEL', 'REACTION'],
});

client.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = await import(filePath);
  client.commands.set(command.default.data.name, command.default);
}


client.once('ready', async (client) => {
  try {
    await db();
    console.log(`🤖 ${process.env.BOT_NAME} is online 🚀!`);
  } catch (error) {
    console.warn(error);
  }
});

client.on('messageReactionAdd', async (reaction, user) => {
  if (reaction.message.channelId !== process.env.WELCOME_CHANNEL) return;
  const guild = reaction.message.guild;
  let role = guild.roles.cache.find(r => r.name === process.env.WELCOME_ROLE);
  if (role) {
    await guild.members.cache.get(user.id).roles.add(role);
  };
});
client.on('messageReactionRemove', async (reaction, user) => {
  if (reaction.message.channelId !== process.env.WELCOME_CHANNEL) return;
  const guild = reaction.message.guild;
  let role = guild.roles.cache.find(r => r.name === process.env.WELCOME_ROLE);
  if (role) {
    await guild.members.cache.get(user.id).roles.remove(role);
  };
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  const user = await User.getByDiscord(message.author.id);
  const dubs = message.content.trim().split(/\s+/).filter(w => w.length > 1).length;
  console.log('dubs collected', dubs);
  if (!user) {
    await User.create({ discord_id: message.author.id, discord_username: message.author.username, dubs });
    return;
  }


  // TODO: we can do 1 request for the 2 actions one update
  const totalDubs = user.dubs + dubs;

  // Level the user
  let levelUp = false;
  if (Levels[user.level] && (totalDubs >= Levels[user.level].dubs)) {
    levelUp = true;
  }

  const updateObject = { dubs: totalDubs, level: levelUp ? user.level + 1 : user.level }
  await User.updateByDiscordId(message.author.id, updateObject);

  // add role
  if (levelUp) {
    let role = message.guild.roles.cache.find(r => r.name === `Bot level ${user.level + 1}`);
    if (role) {
      await message.guild.members.cache.get(message.author.id).roles.add(role);
      message.reply(codeBlock('yaml', `You have collected ${totalDubs} $dubs and reached level ${user.level + 1}!`));
    };
  }
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isCommand()) return;

  const command = client.commands.get(interaction.commandName);
  if (!command) return;


  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    await interaction.reply({ content: 'There was an error while excuting this command!', ephemeral: true })
  }
});

client.login(process.env.DISCORD_TOKEN);