import { Models } from '../db/index.js';

const User = {
  getByDiscord(discord_id) {
    return Models.User.findOne({ discord_id });
  },
  create(data) {
    return Models.User.create(data);
  },
  updateByDiscordId: (discord_id, data) => Models.User.findOneAndUpdate({ discord_id }, data),
  getTop: (top) => Models.User.find({}).sort({ dubs: -1 }).limit(top),
}

const Seed = {
  findById(id) {
    return Models.Seed.findById(id);
  }
}

export {
  User,
  Seed
}