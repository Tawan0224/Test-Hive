import fs from 'fs';
import Quiz from '../models/Quiz.js';
import { generateQuizFromPDF } from '../services/aiService.js';

// ────────────────────────────────────────────
// @desc    Generate a quiz from an uploaded PDF using AI
// @route   POST /api/ai/generate
// @access  Private
// ────────────────────────────────────────────
export const generateQuiz = async (req, res) => {
  const filePath = req.file?.path;

  try {
    const { quizType, count, customInstructions, difficulty = 'medium' } = req.body;

    // Validate inputs
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: { code: 'NO_FILE', message: 'Please upload a PDF file.' },
      });
    }

    const validTypes = ['multiple-choice', 'matching', 'flashcard'];
    if (!validTypes.includes(quizType)) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_TYPE', message: 'Invalid quiz type.' },
      });
    }

    const questionCount = parseInt(count, 10);
    if (![10, 15, 20].includes(questionCount)) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_COUNT', message: 'Count must be 10, 15, or 20.' },
      });
    }

    // Call Ai
    const generated = await generateQuizFromPDF({
      filePath,
      quizType,
      count: questionCount,
      customInstructions: customInstructions || '',
    });

    // Build quiz payload depending on type
    const quizData = {
      title: generated.title || `AI Quiz from ${req.file.originalname}`,
      type: quizType,
      difficulty,
      creatorId: req.user._id,
      aiGenerated: true,
      aiParameters: {
        pdfSource: req.file.originalname,
        customInstructions: customInstructions || '',
        generatedAt: new Date(),
      },
    };

    if (quizType === 'multiple-choice') {
      if (!generated.questions || generated.questions.length === 0) {
        throw new Error('AI did not return any questions.');
      }
      quizData.questions = generated.questions;
      quizData.matchingQuestions = [];
      quizData.flashcards = [];
    } else if (quizType === 'flashcard') {
      if (!generated.cards || generated.cards.length === 0) {
        throw new Error('AI did not return any flashcards.');
      }
      quizData.flashcards = generated.cards.map((c) => ({
        front: c.front,
        back: c.back,
        deckName: c.deckName || generated.deckName || '',
      }));
      quizData.questions = [];
      quizData.matchingQuestions = [];
    } else if (quizType === 'matching') {
      if (!generated.pairs || generated.pairs.length === 0) {
        throw new Error('AI did not return any matching pairs.');
      }
      quizData.matchingQuestions = [
        {
          pairs: generated.pairs,
          timeLimit: generated.timeLimit || 120,
          points: generated.points || 10,
        },
      ];
      quizData.questions = [];
      quizData.flashcards = [];
    }

    // Save to DB
    const quiz = await Quiz.create(quizData);

    res.status(201).json({
      success: true,
      data: {
        quiz,
        generated, // send raw generated data to frontend for navigation
      },
    });
  } catch (error) {
    console.error('AI generation error:', error.message);

    // Check for AI-specific errors
    if (error.message?.includes('API key')) {
      return res.status(500).json({
        success: false,
        error: { code: 'AI_AUTH', message: 'Invalid OpenRouter API key. Check your .env file.' },
      });
    }

    if (error.message?.includes('quota') || error.message?.includes('rate')) {
      return res.status(429).json({
        success: false,
        error: { code: 'RATE_LIMIT', message: 'AI rate limit reached. Please wait a moment and try again.' },
      });
    }

    res.status(500).json({
      success: false,
      error: { code: 'GENERATION_FAILED', message: error.message || 'Failed to generate quiz. Please try again.' },
    });
  } finally {
    // Always clean up the uploaded temp file
    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }
};