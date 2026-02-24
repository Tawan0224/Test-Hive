import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Achievement from '../models/Achievement.js';
import QuizAttempt from '../models/QuizAttempt.js';

dotenv.config({ path: new URL('../../.env', import.meta.url).pathname });

async function backfill() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  const allAchievements = await Achievement.find();
  const users = await User.find();

  console.log(`Processing ${users.length} user(s)...\n`);

  for (const user of users) {
    const unlockedIds = new Set(user.achievements.map(a => a.achievementId.toString()));
    const newlyUnlocked = [];

    // Get best accuracy from all attempts for score_percentage achievements
    const attempts = await QuizAttempt.find({ userId: user._id });
    const bestAccuracy = attempts.length > 0
      ? Math.max(...attempts.map(a => a.accuracy))
      : 0;

    for (const achievement of allAchievements) {
      if (unlockedIds.has(achievement._id.toString())) continue;

      let earned = false;
      if (achievement.type === 'quizzes_completed') {
        earned = (user.stats?.quizzesCompleted || 0) >= achievement.requirement;
      } else if (achievement.type === 'score_percentage') {
        earned = bestAccuracy >= achievement.requirement;
      } else if (achievement.type === 'streak') {
        const bestStreak = Math.max(user.stats?.currentStreak || 0, user.stats?.longestStreak || 0);
        earned = bestStreak >= achievement.requirement;
      }

      if (earned) {
        user.achievements.push({ achievementId: achievement._id, unlockedAt: new Date() });
        newlyUnlocked.push(achievement.name);
      }
    }

    if (newlyUnlocked.length > 0) {
      await user.save();
      console.log(`${user.username}: unlocked ${newlyUnlocked.join(', ')}`);
    } else {
      console.log(`${user.username}: no new achievements`);
    }
  }

  console.log('\nBackfill complete');
  await mongoose.disconnect();
}

backfill().catch((err) => {
  console.error('Backfill failed:', err);
  process.exit(1);
});
