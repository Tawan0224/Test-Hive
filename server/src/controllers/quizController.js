import Quiz from '../models/Quiz.js';
import QuizAttempt from '../models/QuizAttempt.js';
import User from '../models/User.js';

// ────────────────────────────────────────────
// @desc    Create a new quiz
// @route   POST /api/quizzes
// @access  Private
// ────────────────────────────────────────────
export const createQuiz = async (req, res) => {
  try {
    const {
      title,
      description,
      type,
      difficulty,
      questions,        // for multiple-choice
      matchingQuestions, // for matching
      flashcards,       // for flashcard
      tags,
      aiGenerated,
      aiParameters,
    } = req.body;

    // Validate that questions exist for the given type
    if (type === 'multiple-choice' && (!questions || questions.length === 0)) {
      return res.status(400).json({
        success: false,
        error: { code: 'NO_QUESTIONS', message: 'Multiple choice quiz must have at least 1 question' },
      });
    }
    if (type === 'matching' && (!matchingQuestions || matchingQuestions.length === 0)) {
      return res.status(400).json({
        success: false,
        error: { code: 'NO_QUESTIONS', message: 'Matching quiz must have at least 1 set of pairs' },
      });
    }
    if (type === 'flashcard' && (!flashcards || flashcards.length === 0)) {
      return res.status(400).json({
        success: false,
        error: { code: 'NO_QUESTIONS', message: 'Flashcard deck must have at least 1 card' },
      });
    }

    const quiz = await Quiz.create({
      title,
      description,
      type,
      difficulty,
      creatorId: req.user._id,
      questions: type === 'multiple-choice' ? questions : [],
      matchingQuestions: type === 'matching' ? matchingQuestions : [],
      flashcards: type === 'flashcard' ? flashcards : [],
      tags: tags || [],
      aiGenerated: aiGenerated || false,
      aiParameters: aiParameters || {},
    });

    res.status(201).json({
      success: true,
      data: { quiz },
    });
  } catch (error) {
    console.error('Create quiz error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'CREATE_FAILED', message: 'Failed to create quiz' },
    });
  }
};

// ────────────────────────────────────────────
// @desc    Get quizzes created by the logged-in user
// @route   GET /api/quizzes/mine
// @access  Private
// ────────────────────────────────────────────
export const getMyQuizzes = async (req, res) => {
  try {
    const quizzes = await Quiz.find({ creatorId: req.user._id })
      .sort({ createdAt: -1 })
      .select('title type difficulty questionCount stats shareCode createdAt');

    res.json({
      success: true,
      data: { quizzes },
    });
  } catch (error) {
    console.error('Get my quizzes error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'FETCH_FAILED', message: 'Failed to fetch quizzes' },
    });
  }
};

// ────────────────────────────────────────────
// @desc    Get a single quiz by ID
// @route   GET /api/quizzes/:id
// @access  Private
// ────────────────────────────────────────────
export const getQuizById = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);

    if (!quiz) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Quiz not found' },
      });
    }

    // Allow access if user is the creator OR quiz is public/shared
    const isCreator = quiz.creatorId.toString() === req.user._id.toString();
    if (!isCreator && !quiz.isPublic) {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'You do not have access to this quiz' },
      });
    }

    res.json({
      success: true,
      data: { quiz },
    });
  } catch (error) {
    console.error('Get quiz error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'FETCH_FAILED', message: 'Failed to fetch quiz' },
    });
  }
};

// ────────────────────────────────────────────
// @desc    Get a quiz by share code (no auth needed to take shared quizzes)
// @route   GET /api/quizzes/share/:shareCode
// @access  Public
// ────────────────────────────────────────────
export const getQuizByShareCode = async (req, res) => {
  try {
    const quiz = await Quiz.findOne({
      shareCode: req.params.shareCode.toUpperCase(),
    });

    if (!quiz) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Quiz not found with this share code' },
      });
    }

    res.json({
      success: true,
      data: { quiz },
    });
  } catch (error) {
    console.error('Get quiz by share code error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'FETCH_FAILED', message: 'Failed to fetch quiz' },
    });
  }
};

// ────────────────────────────────────────────
// @desc    Delete a quiz
// @route   DELETE /api/quizzes/:id
// @access  Private (creator only)
// ────────────────────────────────────────────
export const deleteQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);

    if (!quiz) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Quiz not found' },
      });
    }

    if (quiz.creatorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'You can only delete your own quizzes' },
      });
    }

    await Quiz.findByIdAndDelete(req.params.id);

    // Also delete all attempts for this quiz
    await QuizAttempt.deleteMany({ quizId: req.params.id });

    res.json({
      success: true,
      data: { message: 'Quiz deleted successfully' },
    });
  } catch (error) {
    console.error('Delete quiz error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'DELETE_FAILED', message: 'Failed to delete quiz' },
    });
  }
};

// ────────────────────────────────────────────
// @desc    Submit a quiz attempt (save results)
// @route   POST /api/quizzes/:id/attempts
// @access  Private
// ────────────────────────────────────────────
export const submitQuizAttempt = async (req, res) => {
  try {
    const {
      answers,
      score,
      totalQuestions,
      correctAnswers,
      accuracy,
      timeSpentSeconds,
      weakTopics,
    } = req.body;

    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Quiz not found' },
      });
    }

    // Create the attempt
    const attempt = await QuizAttempt.create({
      userId: req.user._id,
      quizId: quiz._id,
      quizTitle: quiz.title,
      quizType: quiz.type,
      answers: answers || [],
      score,
      totalQuestions,
      correctAnswers,
      accuracy,
      timeSpentSeconds: timeSpentSeconds || 0,
      weakTopics: weakTopics || [],
    });

    // Update quiz stats
    const allAttempts = await QuizAttempt.find({ quizId: quiz._id });
    const totalAttempts = allAttempts.length;
    const avgScore = allAttempts.reduce((sum, a) => sum + a.accuracy, 0) / totalAttempts;
    const avgTime = allAttempts.reduce((sum, a) => sum + a.timeSpentSeconds, 0) / totalAttempts;

    quiz.stats.totalAttempts = totalAttempts;
    quiz.stats.averageScore = Math.round(avgScore * 100) / 100;
    quiz.stats.averageTimeSeconds = Math.round(avgTime);
    await quiz.save();

    // Update user stats
    const user = await User.findById(req.user._id);
    if (user) {
      user.stats.quizzesCompleted = (user.stats.quizzesCompleted || 0) + 1;
      user.stats.totalScore = (user.stats.totalScore || 0) + score;

      // Recalculate average
      user.stats.averageScore = Math.round(
        user.stats.totalScore / user.stats.quizzesCompleted
      );

      // Update streak
      const now = new Date();
      const lastQuizDate = user.stats.lastQuizDate;
      if (lastQuizDate) {
        const diffHours = (now - lastQuizDate) / (1000 * 60 * 60);
        if (diffHours <= 48) {
          // Check if it's a new day (not same day)
          const lastDay = lastQuizDate.toDateString();
          const today = now.toDateString();
          if (lastDay !== today) {
            user.stats.currentStreak = (user.stats.currentStreak || 0) + 1;
          }
        } else {
          // Streak broken
          user.stats.currentStreak = 1;
        }
      } else {
        user.stats.currentStreak = 1;
      }

      if (user.stats.currentStreak > (user.stats.longestStreak || 0)) {
        user.stats.longestStreak = user.stats.currentStreak;
      }

      user.stats.lastQuizDate = now;
      await user.save();
    }

    res.status(201).json({
      success: true,
      data: {
        attempt,
        updatedStats: user?.stats,
      },
    });
  } catch (error) {
    console.error('Submit attempt error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'SUBMIT_FAILED', message: 'Failed to save quiz results' },
    });
  }
};

// ────────────────────────────────────────────
// @desc    Get current user's quiz attempt history
// @route   GET /api/attempts/mine
// @access  Private
// ────────────────────────────────────────────
export const getMyAttempts = async (req, res) => {
  try {
    const attempts = await QuizAttempt.find({ userId: req.user._id })
      .sort({ completedAt: -1 })
      .limit(50)
      .select('quizId quizTitle quizType score totalQuestions correctAnswers accuracy timeSpentSeconds completedAt');

    res.json({
      success: true,
      data: { attempts },
    });
  } catch (error) {
    console.error('Get attempts error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'FETCH_FAILED', message: 'Failed to fetch quiz history' },
    });
  }
};