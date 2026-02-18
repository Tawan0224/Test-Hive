import express from 'express';
import {
  createQuiz,
  getMyQuizzes,
  getQuizById,
  getQuizByShareCode,
  deleteQuiz,
  submitQuizAttempt,
  getMyAttempts,
} from '../controllers/quizController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// ── Quiz CRUD ──
router.post('/', protect, createQuiz);              // POST   /api/quizzes
router.get('/mine', protect, getMyQuizzes);          // GET    /api/quizzes/mine
router.get('/share/:shareCode', getQuizByShareCode); // GET    /api/quizzes/share/:code  (public)
router.get('/:id', protect, getQuizById);            // GET    /api/quizzes/:id
router.delete('/:id', protect, deleteQuiz);          // DELETE /api/quizzes/:id

// ── Quiz Attempts ──
router.post('/:id/attempts', protect, submitQuizAttempt); // POST /api/quizzes/:id/attempts

export default router;