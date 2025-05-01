const mongoose = require('mongoose');
const PinSchema = new mongoose.Schema({
  title:     { type: String, required: true },
  link:      { type: String, required: true },
  body:      { type: String, default: '' },
  tags:      [String],
  isPrivate: { type: Boolean, default: false },
  image:     { type: String, default: null },
  author:    { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model('Pin', PinSchema);
