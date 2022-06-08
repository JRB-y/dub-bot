import mongoose from 'mongoose';

const Models = {
  User: mongoose.model('User', {
    discord_id: Number,
    discord_username: String,
    dubs: mongoose.Types.Decimal128,
    weed: [{
      id: { type: mongoose.Schema.Types.ObjectId, ref: 'Seed' },
      quantity: { type: Number, default: 0 },
    }],
    level: { type: Number, default: 0 },
    max_seeds: { type: Number, default: 3 },
    seeds: [{
      id: { type: mongoose.Schema.Types.ObjectId, ref: 'Seed' },
      feeds: { type: Number, default: 0 },
      max_feeds: { type: Number, require: true },
      last_feed: { type: Date, default: null },
      created_at: { type: Date, default: Date.now },
    }],
    last_work: { type: Date, default: null },
    worked: { type: Number, default: 0 }
  }),
  Seed: mongoose.model('Seed', {
    name: String,
    price: { type: Number, default: 1 },
    sell_price: { type: Number, default: 1 },
    grow_feeds: { type: Number, default: 1 },
    havest: {type: Number, default: 1 },
    descriptions: { type: String, default: null},
    wikipedia_url: { type: String, default: null },
  }),
}

export {
  Models,
}
