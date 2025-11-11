const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: __dirname + '/../.env' });

mongoose.set('strictQuery', true);

const User = require('../server/models/User');

async function run() {
  await mongoose.connect(process.env.MONGO_URL);
  const users = await User.find({}, 'email username createdAt');
  console.log('📜 Users:');
  users.forEach(user => {
    console.log(`- ${user.username} (${user.email}) created at ${user.createdAt}`);
  });
  process.exit();
}

run();
