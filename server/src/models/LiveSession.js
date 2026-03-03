import mongoose from 'mongoose';
import crypto from 'crypto';

const participantSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  username: { type: String, required: true },
  displayName: { type: String, default: '' },
  joinedAt: { type: Date, default: Date.now },
  finalScore: { type: Number, default: 0 },
  finalHP: { type: Number, default: 100 },
  correctCount: { type: Number, default: 0 },
}, { _id: false });

const liveSessionSchema = new mongoose.Schema({
  quizId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz',
    required: true,
  },
  hostId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  sessionCode: {
    type: String,
    unique: true,
    required: true,
  },
  status: {
    type: String,
    enum: ['lobby', 'active', 'paused', 'completed'],
    default: 'lobby',
  },
  bossMaxHP: { type: Number, required: true },
  bossCurrentHP: { type: Number, required: true },
  participants: [participantSchema],
  currentQuestionIndex: { type: Number, default: -1 },
  startedAt: Date,
  completedAt: Date,
}, {
  timestamps: true,
});

// Generate a unique 6-char session code
liveSessionSchema.statics.generateCode = function () {
  return crypto.randomBytes(3).toString('hex').toUpperCase();
};

const LiveSession = mongoose.model('LiveSession', liveSessionSchema);
export default LiveSession;
