import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import fs from 'fs';
import connectDB from './src/config/db.js';
import authRoutes from './src/routes/auth.js';
import quizRoutes from './src/routes/quiz.js';
import attemptRoutes from './src/routes/attempts.js';
import aiRoutes from './src/routes/ai.js';

dotenv.config();
console.log('🔑 OpenRouter key loaded:', process.env.OPENROUTER_API_KEY ? 'YES ✅' : 'NO ❌');

// Ensure temp upload directory exists
const UPLOAD_DIR = '/tmp/testhive-uploads';
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

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

app.listen(PORT, () => {
  console.log(`🐝 TestHive server running on port ${PORT}`);
});