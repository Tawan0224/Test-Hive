import mongoose from 'mongoose';

const answerSchema = new mongoose.Schema({
  questionIndex: { type: Number, required: true },
  userAnswer: { type: mongoose.Schema.Types.Mixed }, // varies by quiz type
  isCorrect: { type: Boolean, required: true },
  timeSpentSeconds: { type: Number, default: 0 },
}, { _id: false });

const quizAttemptSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  quizId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz',
    required: true,
  },
  quizTitle: {
    type: String,
    required: true,
  },
  quizType: {
    type: String,
    enum: ['multiple-choice', 'matching', 'flashcard'],
    required: true,
  },
  answers: [answerSchema],
  score: {
    type: Number,
    required: true,
  },
  totalQuestions: {
    type: Number,
    required: true,
  },
  correctAnswers: {
    type: Number,
    required: true,
  },
  accuracy: {
    type: Number,
    required: true,
  },
  timeSpentSeconds: {
    type: Number,
    default: 0,
  },
  completedAt: {
    type: Date,
    default: Date.now,
  },
  weakTopics: [String],
}, {
  timestamps: true,
});

// Index for efficient queries
quizAttemptSchema.index({ userId: 1, completedAt: -1 });
quizAttemptSchema.index({ quizId: 1 });

const QuizAttempt = mongoose.model('QuizAttempt', quizAttemptSchema);
export default QuizAttempt;