import express from 'express';
import { getMyAttempts } from '../controllers/quizController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/mine', protect, getMyAttempts); // GET /api/attempts/mine

export default router;