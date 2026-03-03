import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import { createLiveSession, getMyLiveSessions } from '../controllers/liveSessionController.js';

const router = Router();

// GET /api/live-sessions/mine — Get user's completed live session history
router.get('/mine', protect, getMyLiveSessions);

// POST /api/live-sessions — Create a new live session from a quiz
router.post('/', protect, createLiveSession);

export default router;
