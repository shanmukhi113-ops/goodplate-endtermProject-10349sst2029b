import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import { connectDB } from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import mealRoutes from './routes/mealRoutes.js';

const app = express();
const port = Number(process.env.PORT || 5000);
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  console.error('JWT_SECRET must be set to a random secret of at least 32 characters.');
  process.exit(1);
}
app.set('trust proxy', 1);
app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json({ limit: '20kb' }));
app.use(cookieParser());
app.use('/api/auth', rateLimit({ windowMs: 15 * 60 * 1000, limit: 60, standardHeaders: true, legacyHeaders: false }), authRoutes);
app.use('/api/meals', mealRoutes);
app.get('/api/health', (_req, res) => res.json({ status: 'ok', service: 'Goodplate API' }));
app.use((req, res) => res.status(404).json({ message: `Route not found: ${req.method} ${req.path}` }));
app.use((err, _req, res, _next) => {
  console.error(err);
  if (err.name === 'ValidationError') return res.status(400).json({ message: 'Please check the submitted details.' });
  if (err.name === 'CastError') return res.status(400).json({ message: 'Invalid ID format.' });
  return res.status(500).json({ message: 'Unexpected server error. Please try again.' });
});

// Local only. On Vercel, api/index.js connects to the DB and handles requests.
if (!process.env.VERCEL) {
  connectDB().then(() => app.listen(port, () => console.log(`Goodplate API listening on http://localhost:${port}`)))
    .catch((error) => { console.error('Could not start server:', error.message); process.exit(1); });
}

export default app;