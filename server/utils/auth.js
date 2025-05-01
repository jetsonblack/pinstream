const jwt = require('jsonwebtoken');
const User = require('../models/User');
exports.authenticate = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token' });

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(payload.id).select('-password');
    if (!req.user) return res.status(401).json({ error: 'Invalid user' });
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
};
