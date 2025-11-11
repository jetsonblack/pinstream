const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: __dirname + '/../.env' });

mongoose.set('strictQuery', true);

const Pin = require('../server/models/Pin');
const User = require('../server/models/User'); 

async function run() {
  await mongoose.connect(process.env.MONGO_URL);
  const pins = await Pin.find().populate('author', 'username');
  console.log(pins);
  process.exit();
}

run();
