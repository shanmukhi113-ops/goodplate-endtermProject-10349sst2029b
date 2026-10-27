import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { cookieOptions } from '../utils/authCookie.js';

const publicUser = (user) => ({ id: user._id, name: user.name, email: user.email });
const issueCookie = (res, user) => {
  const token = jwt.sign({ sub: user._id.toString() }, process.env.JWT_SECRET, { expiresIn: '7d' });
  res.cookie(process.env.COOKIE_NAME || 'goodplate_token', token, cookieOptions());
};

export async function signup(req, res, next) {
  try {
    const name = String(req.body.name || '').trim();
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = String(req.body.password || '');
    if (name.length < 2 || name.length > 60) return res.status(400).json({ message: 'Name must be between 2 and 60 characters.' });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) return res.status(400).json({ message: 'Enter a valid email address.' });
    if (password.length < 8 || password.length > 128) return res.status(400).json({ message: 'Password must be 8–128 characters long.' });
    const exists = await User.findOne({ email });
    if (exists) return res.status(409).json({ message: 'An account with this email already exists. Please log in.' });
    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({ name, email, passwordHash });
    issueCookie(res, user);
    return res.status(201).json({ user: publicUser(user) });
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ message: 'An account with this email already exists.' });
    next(error);
  }
}

export async function login(req, res, next) {
  try {
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = String(req.body.password || '');
    const user = await User.findOne({ email }).select('+passwordHash');
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(401).json({ message: 'Email or password is incorrect.' });
    }
    issueCookie(res, user);
    return res.json({ user: publicUser(user) });
  } catch (error) { next(error); }
}

export function logout(req, res) {
  res.clearCookie(process.env.COOKIE_NAME || 'goodplate_token', { ...cookieOptions(), maxAge: undefined });
  return res.json({ message: 'You have logged out.' });
}

export function me(req, res) { return res.json({ user: req.user ? publicUser(req.user) : null }); }