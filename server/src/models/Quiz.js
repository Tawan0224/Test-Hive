import mongoose from 'mongoose';
import crypto from 'crypto';

// Multiple Choice question sub-schema
const multipleChoiceQuestionSchema = new mongoose.Schema({
  questionText: { type: String, required: true },
  options: [
    {
      text: { type: String, required: true },
      isCorrect: { type: Boolean, required: true },
    },
  ],
  timeLimit: { type: Number, default: 30 },
  points: { type: Number, default: 10 },
}, { _id: false });

// Matching pair sub-schema
const matchingPairSchema = new mongoose.Schema({
  left: { type: String, required: true },
  right: { type: String, required: true },
}, { _id: false });

// Matching question sub-schema
const matchingQuestionSchema = new mongoose.Schema({
  pairs: [matchingPairSchema],
  timeLimit: { type: Number, default: 120 },
  points: { type: Number, default: 10 },
}, { _id: false });

// Flashcard sub-schema
const flashcardSchema = new mongoose.Schema({
  front: { type: String, required: true },
  back: { type: String, required: true },
  deckName: { type: String, default: '' },
}, { _id: false });

const quizSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Quiz title is required'],
    trim: true,
    maxlength: 200,
  },
  description: {
    type: String,
    trim: true,
    maxlength: 1000,
    default: '',
  },
  creatorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  type: {
    type: String,
    enum: ['multiple-choice', 'matching', 'flashcard'],
    required: true,
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium',
  },

  // Type-specific question data
  questions: [multipleChoiceQuestionSchema],   // for multiple-choice
  matchingQuestions: [matchingQuestionSchema],  // for matching
  flashcards: [flashcardSchema],               // for flashcard

  isPublic: {
    type: Boolean,
    default: false,
  },
  shareCode: {
    type: String,
    unique: true,
    sparse: true, // allows multiple null values
  },
  aiGenerated: {
    type: Boolean,
    default: false,
  },
  aiParameters: {
    pdfSource: String,
    customInstructions: String,
    generatedAt: Date,
  },
  tags: [String],
  stats: {
    totalAttempts: { type: Number, default: 0 },
    averageScore: { type: Number, default: 0 },
    averageTimeSeconds: { type: Number, default: 0 },
  },
}, {
  timestamps: true,
});

// Generate unique share code before saving (if not already set)
quizSchema.pre('save', function (next) {
  if (!this.shareCode) {
    this.shareCode = crypto.randomBytes(4).toString('hex').toUpperCase(); // 8-char code
  }
  next();
});

// Virtual to get question count regardless of type
quizSchema.virtual('questionCount').get(function () {
  if (this.type === 'multiple-choice') return this.questions?.length || 0;
  if (this.type === 'matching') return this.matchingQuestions?.length || 0;
  if (this.type === 'flashcard') return this.flashcards?.length || 0;
  return 0;
});

// Include virtuals in JSON
quizSchema.set('toJSON', { virtuals: true });
quizSchema.set('toObject', { virtuals: true });

const Quiz = mongoose.model('Quiz', quizSchema);
export default Quiz;