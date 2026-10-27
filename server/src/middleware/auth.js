import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export async function requireAuth(req, res, next) {
  try {
    const token = req.cookies?.[process.env.COOKIE_NAME || 'goodplate_token'];
    if (!token) return res.status(401).json({ message: 'Please log in to continue.' });
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.sub).select('_id name email');
    if (!user) return res.status(401).json({ message: 'Your session is no longer valid. Please log in again.' });
    req.user = user;
    next();
  } catch {
    return res.status(401).json({ message: 'Your session has expired. Please log in again.' });
  }
}

export async function optionalAuth(req, _res, next) {
  try {
    const token = req.cookies?.[process.env.COOKIE_NAME || 'goodplate_token'];
    if (token) {
      const payload = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(payload.sub).select('_id name email');
      if (user) req.user = user;
    }
  } catch {
    // invalid or expired token: treat as a guest
  }
  next();
}
