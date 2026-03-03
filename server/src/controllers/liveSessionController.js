import Quiz from '../models/Quiz.js';
import LiveSession from '../models/LiveSession.js';
import { createSession, getSession, calculateBossHP } from '../socket/sessionStore.js';

export const createLiveSession = async (req, res) => {
  try {
    const { quizId } = req.body;
    if (!quizId) {
      return res.status(400).json({ success: false, error: { code: 'MISSING_QUIZ_ID', message: 'quizId is required' } });
    }

    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ success: false, error: { code: 'QUIZ_NOT_FOUND', message: 'Quiz not found' } });
    }
    if (quiz.type !== 'multiple-choice') {
      return res.status(400).json({ success: false, error: { code: 'INVALID_QUIZ_TYPE', message: 'Only multiple-choice quizzes support live sessions' } });
    }
    if (quiz.creatorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Only the quiz creator can host a live session' } });
    }

    // Generate unique code
    let sessionCode;
    let attempts = 0;
    do {
      sessionCode = LiveSession.generateCode();
      attempts++;
    } while (getSession(sessionCode) && attempts < 10);

    const bossHP = calculateBossHP(1);

    const liveSession = await LiveSession.create({
      quizId: quiz._id,
      hostId: req.user._id,
      sessionCode,
      bossMaxHP: bossHP,
      bossCurrentHP: bossHP,
    });

    // Create in-memory session (socket id will be set when host connects via socket)
    createSession({
      sessionCode,
      quiz: quiz.toObject(),
      hostId: req.user._id,
      hostSocketId: null,
    });

    res.status(201).json({
      success: true,
      data: {
        sessionCode,
        sessionId: liveSession._id,
        quizTitle: quiz.title,
        questionCount: quiz.questions.length,
      },
    });
  } catch (err) {
    console.error('createLiveSession error:', err);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create session' } });
  }
};
