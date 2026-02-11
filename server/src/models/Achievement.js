import mongoose from 'mongoose';

const achievementSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  icon: {
    type: String,
    default: '',
  },
  type: {
    type: String,
    enum: ['quizzes_completed', 'score_percentage', 'streak'],
    required: true,
  },
  requirement: {
    type: Number,
    required: true,
  },
  rarity: {
    type: String,
    enum: ['common', 'rare', 'epic', 'legendary'],
    default: 'common',
  },
}, {
  timestamps: true,
});

const Achievement = mongoose.model('Achievement', achievementSchema);
export default Achievement;