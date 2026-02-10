import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: function () {
      return this.authProvider === 'email';
    },
    minlength: 8,
    select: false, // Don't return password by default in queries
  },
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30,
  },
  displayName: {
    type: String,
    trim: true,
  },
  profilePicture: {
    type: String,
    default: '',
  },
  authProvider: {
    type: String,
    enum: ['email', 'google', 'facebook'],
    default: 'email',
  },
  authProviderId: {
    type: String,
  },
  lastLogin: {
    type: Date,
    default: Date.now,
  },
  stats: {
    quizzesCompleted: { type: Number, default: 0 },
    currentStreak: { type: Number, default: 0 },
    longestStreak: { type: Number, default: 0 },
    lastQuizDate: { type: Date },
    totalScore: { type: Number, default: 0 },
    averageScore: { type: Number, default: 0 },
  },
  achievements: [
    {
      achievementId: { type: mongoose.Schema.Types.ObjectId, ref: 'Achievement' },
      unlockedAt: { type: Date, default: Date.now },
    },
  ],
}, {
  timestamps: true, // adds createdAt and updatedAt
});

// Hash password before saving
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Remove sensitive fields when converting to JSON
userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password;
  delete user.__v;
  return user;
};

const User = mongoose.model('User', userSchema);
export default User;