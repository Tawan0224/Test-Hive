import express from 'express';
import multer from 'multer';
import path from 'path';
import { generateQuiz } from '../controllers/aiController.js';
import { protect } from '../middleware/auth.js';
import rateLimit from 'express-rate-limit';

const router = express.Router();

// Rate limit AI generation (expensive API calls)
const aiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20, 
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT',
      message: 'Too many generation requests. Please wait a minute and try again.',
    },
  },
});

// Multer config — store PDFs in /tmp/testhive-uploads/
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, '/tmp/testhive-uploads/');
  },
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}${path.extname(file.originalname)}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Only PDF files are allowed'), false);
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter,
});

// POST /api/ai/generate
router.post(
  '/generate',
  protect,
  aiLimiter,
  upload.single('pdf'),
  generateQuiz
);

export default router;