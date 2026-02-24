import express from 'express';
import Achievement from '../models/Achievement.js';

const router = express.Router();

// GET /api/achievements — list all achievements
router.get('/', async (req, res) => {
  try {
    const achievements = await Achievement.find().sort({ type: 1, requirement: 1 });
    res.json({ success: true, data: achievements });
  } catch (error) {
    console.error('Fetch achievements error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'FETCH_FAILED', message: 'Failed to fetch achievements' },
    });
  }
});

export default router;
