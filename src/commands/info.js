import { Interaction } from 'discord.js';
import { SlashCommandBuilder, blockQuote, codeBlock } from '@discordjs/builders';
import { User } from '../queries/index.js';
import moment from 'moment';
import { Config } from '../config/index.js';

// es module __dirname
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import path from 'path';
const infoTEXT = `
DubBot is bot that simulate cannabis cultivation, here you can work in the cannabis industry.

**Governance tokens**

- $dub: This token can be gained while working and talking in the server.
- $weed: This token can be only earned while harvesting plants.


To earn $dub and $weed you need to talk, work, shop, feed and harvest.

**Commands**

/ping: get bot and server states.
/inventory: display your level, $dub, slots and plants.
/shop seed: buy a seed.
/feed cost: calculate feed cost.
/feed plant <slotId>: feed the plant in the slotId (slotId are 3 digit id visible in the inventory)

/drops: display the drops of the day.

**Dev phase**
We are currently in development phase, so be kind with our bot!
- He is not always running (the bot is not hosted yet)
- He is buggy.*
!important: $dub and $weed earned during this phase can be persistent over next phases.
`;


export default {
  data: new SlashCommandBuilder()
    .setName('info')
    .setDescription('Get info about me !'),

  /**
   * Return information about the bot and current server.
   *
   * @param {Interaction} interaction
  */
  async execute(interaction) {
    await interaction.reply({
      content: codeBlock('fix', infoTEXT),
      ephemeral: true,
    });
  },
};
