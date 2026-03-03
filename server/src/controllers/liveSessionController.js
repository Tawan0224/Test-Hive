import Quiz from '../models/Quiz.js';
import LiveSession from '../models/LiveSession.js';
import { createSession, getSession, calculateBossHP } from '../socket/sessionStore.js';

export const getMyLiveSessions = async (req, res) => {
  try {
    // Find sessions where user was host or participant, completed only
    const sessions = await LiveSession.find({
      status: 'completed',
      $or: [
        { hostId: req.user._id },
        { 'participants.userId': req.user._id },
      ],
    })
      .sort({ completedAt: -1 })
      .limit(50)
      .populate('quizId', 'title')
      .select('sessionCode quizId hostId bossMaxHP bossCurrentHP participants startedAt completedAt');

    const formatted = sessions.map(s => {
      const isHost = s.hostId.toString() === req.user._id.toString();
      const myParticipant = s.participants.find(p => p.userId.toString() === req.user._id.toString());
      const totalQuestions = myParticipant?.correctCount != null
        ? undefined // we don't store totalQuestions on participant, but we can compute accuracy from it
        : undefined;

      return {
        _id: s._id,
        sessionCode: s.sessionCode,
        quizTitle: s.quizId?.title || 'Deleted Quiz',
        isHost,
        bossDefeated: s.bossCurrentHP <= 0,
        playerCount: s.participants.length,
        myScore: myParticipant?.finalScore ?? null,
        myRank: isHost ? null : (() => {
          const sorted = [...s.participants].sort((a, b) => (b.finalScore || 0) - (a.finalScore || 0));
          return sorted.findIndex(p => p.userId.toString() === req.user._id.toString()) + 1;
        })(),
        completedAt: s.completedAt || s.updatedAt,
      };
    });

    res.json({ success: true, data: { sessions: formatted } });
  } catch (err) {
    console.error('getMyLiveSessions error:', err);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch sessions' } });
  }
};

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
