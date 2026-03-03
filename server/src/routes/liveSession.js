import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import { createLiveSession } from '../controllers/liveSessionController.js';

const router = Router();

// POST /api/live-sessions — Create a new live session from a quiz
router.post('/', protect, createLiveSession);

export default router;
