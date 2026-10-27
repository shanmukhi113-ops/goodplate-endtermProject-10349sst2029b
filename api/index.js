import app from '../server/src/server.js';
import { connectDB } from '../server/src/config/db.js';

let ready;
export default async function handler(req, res) {
  try {
    ready = ready || connectDB();
    await ready;
  } catch (error) {
    ready = undefined;
    console.error('DB connection failed:', error.message);
    return res.status(500).json({ message: 'Database connection failed.' });
  }
  return app(req, res);
}