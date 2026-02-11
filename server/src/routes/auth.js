import express from 'express';
import rateLimit from 'express-rate-limit';
import { signup, login, getMe, updateProfile, googleAuth, facebookAuth } from '../controllers/authController.js';
import { signupValidation, loginValidation } from '../middleware/validate.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT',
      message: 'Too many attempts. Please try again in 15 minutes.',
    },
  },
});

router.post('/signup', authLimiter, signupValidation, signup);
router.post('/login', authLimiter, loginValidation, login);
router.post('/google', authLimiter, googleAuth);
router.post('/facebook', authLimiter, facebookAuth);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);

export default router;