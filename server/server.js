const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();
const app = express();

mongoose.set('strictQuery', true);
mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log('✔ MongoDB connected'))
  .catch(err => console.error('✖ MongoDB error', err));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../public_html')));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/pins', require('./routes/pins'));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public_html/index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`▶ Server listening on ${PORT}`));
