import { Router } from 'express';
import { login, logout, me, signup } from '../controllers/authController.js';
import { optionalAuth } from '../middleware/auth.js';const router = Router();
router.post('/signup', signup);
router.post('/login', login);
router.post('/logout', logout);
router.get('/me', optionalAuth, me);
export default router;
