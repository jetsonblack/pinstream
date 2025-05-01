const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const User = require('../server/models/User');

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  const result = await User.deleteMany({});
  console.log(`? Deleted ${result.deletedCount} user(s).`);
  process.exit();
}

run();
