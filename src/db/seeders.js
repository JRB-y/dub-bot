import 'dotenv/config';
import db from '../db.js';

import { Seeds } from '../config/index.js';
import { Models } from '../db/index.js';

const seedDB = async () => {
  await db();
  for (const seed of Seeds) {
    try {
      await Models.Seed.create(seed);
      
    } catch (error) {
      console.error('####');
      console.error(error);
    }
  }
}

seedDB();