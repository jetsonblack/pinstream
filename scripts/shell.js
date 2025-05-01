const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: __dirname + '/../.env' });

mongoose.set('strictQuery', true);

const Pin = require('../server/models/Pin');
const User = require('../server/models/User'); // 👈 this line fixes the error

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  const result = await Pin.deleteMany({});
  console.log(`✅ Deleted ${result.deletedCount} pins.`);
  process.exit();
}

run();
