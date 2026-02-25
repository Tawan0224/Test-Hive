import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import fs from 'fs';
import { fileURLToPath } from 'url';
import connectDB from './src/config/db.js';
import authRoutes from './src/routes/auth.js';
import quizRoutes from './src/routes/quiz.js';
import attemptRoutes from './src/routes/attempts.js';
import aiRoutes from './src/routes/ai.js';
import achievementRoutes from './src/routes/achievements.js';

dotenv.config();

// Ensure temp upload directory exists
const UPLOAD_DIR = '/tmp/testhive-uploads';
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const app = express();
const PORT = process.env.PORT || 5000;
const ENTRY_FILE = fileURLToPath(import.meta.url);
const IS_DIRECT_RUN = process.argv[1] === ENTRY_FILE;
const IS_SERVERLESS =
  process.env.VERCEL === '1' ||
  process.env.AWS_LAMBDA_FUNCTION_NAME ||
  process.env.NETLIFY;

// Connect to MongoDB
connectDB().catch(err => {
  console.error('❌ Failed to connect to MongoDB on startup:', err.message);
});

// Middleware
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
}));
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/attempts', attemptRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/achievements', achievementRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'TestHive API is running' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);

  // Multer errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      success: false,
      error: { code: 'FILE_TOO_LARGE', message: 'PDF must be under 10MB.' },
    });
  }
  if (err.message === 'Only PDF files are allowed') {
    return res.status(400).json({
      success: false,
      error: { code: 'INVALID_FILE_TYPE', message: 'Only PDF files are allowed.' },
    });
  }

  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: 'Something went wrong',
    },
  });
});

// Start server only when run directly in local/dev environments.
if (IS_DIRECT_RUN && !IS_SERVERLESS) {
  app.listen(PORT, () => {
    console.log(`🐝 TestHive server running on port ${PORT}`);
  });
}

export default app;
