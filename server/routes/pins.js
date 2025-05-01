const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const marked = require('marked');
const Pin = require('../models/Pin');
const User = require('../models/User');
const { authenticate } = require('../utils/auth');
const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../public_html/uploads'));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext).replace(/\s+/g, '_');
    cb(null, base + '-' + Date.now() + ext);
  }
});

const upload = multer({ storage });

router.get('/', async (req, res) => {
  let filter = { isPrivate: false };
  const token = req.headers.authorization?.split(' ')[1];

  if (token) {
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(payload.id).select('-password');
      if (req.query.mine === '1' && user) {
        filter = { author: user._id };
      }
    } catch {}
  }

  if (req.query.tags) {
    const tags = req.query.tags.split(',').map(t => t.trim());
    filter.tags = { $in: tags };
  }

  const pins = await Pin.find(filter).sort('-createdAt').populate('author', 'username');
  res.json(pins);
});

router.get('/:id', async (req, res) => {
  const pin = await Pin.findById(req.params.id).populate('author', 'username');
  if (!pin) return res.status(404).json({ error: 'Not found' });

  const token = req.headers.authorization?.split(' ')[1];
  let user = null;

  if (token) {
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET);
      user = await User.findById(payload.id).select('-password');
    } catch {}
  }

  if (pin.isPrivate && (!user || !pin.author._id.equals(user._id))) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  res.json(pin);
});

router.post('/', authenticate, upload.single('image'), async (req, res) => {
  const { title, link, body, tags, isPrivate } = req.body;
  const image = req.file ? `/uploads/${req.file.filename}` : null;
  const pin = await Pin.create({
    title,
    link,
    body: marked.parse(body || ''),
    tags: tags ? tags.split(',').map(t => t.trim()) : [],
    isPrivate: !!isPrivate,
    image,
    author: req.user._id
  });
  res.json(pin);
});

router.put('/:id', authenticate, upload.single('image'), async (req, res) => {
  const pin = await Pin.findById(req.params.id);
  if (!pin) return res.status(404).json({ error: 'Not found' });
  if (!pin.author.equals(req.user._id)) return res.status(403).json({ error: 'Forbidden' });

  pin.title = req.body.title;
  pin.link = req.body.link;
  pin.body = marked.parse(req.body.body || '');
  pin.tags = req.body.tags ? req.body.tags.split(',').map(t => t.trim()) : [];
  pin.isPrivate = !!req.body.isPrivate;

  if (req.file) {
    if (pin.image) {
      const oldPath = path.join(__dirname, '../../public_html', pin.image);
      fs.unlink(oldPath, err => {
        if (err && err.code !== 'ENOENT') console.error('Failed to delete old image:', err);
      });
    }
    pin.image = `/uploads/${req.file.filename}`;
  }

  await pin.save();
  res.json(pin);
});

router.delete('/:id', authenticate, async (req, res) => {
  const pin = await Pin.findById(req.params.id);
  if (!pin) return res.status(404).json({ error: 'Not found' });
  if (!pin.author.equals(req.user._id)) return res.status(403).json({ error: 'Forbidden' });

  if (pin.image) {
    const imagePath = path.join(__dirname, '../../public_html', pin.image);
    fs.unlink(imagePath, err => {
      if (err && err.code !== 'ENOENT') console.error('Failed to delete image:', err);
    });
  }

  await pin.remove();
  res.json({ success: true });
});

module.exports = router;
