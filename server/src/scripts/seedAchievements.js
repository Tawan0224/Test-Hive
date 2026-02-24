import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Achievement from '../models/Achievement.js';

dotenv.config({ path: new URL('../../.env', import.meta.url).pathname });

const ACHIEVEMENTS = [
  { name: 'First Steps',      icon: '🎯', type: 'quizzes_completed', requirement: 1,   rarity: 'common',    description: 'Complete your first quiz' },
  { name: 'Quiz Enthusiast',  icon: '📚', type: 'quizzes_completed', requirement: 10,  rarity: 'common',    description: 'Complete 10 quizzes' },
  { name: 'Quiz Master',      icon: '🏆', type: 'quizzes_completed', requirement: 50,  rarity: 'rare',      description: 'Complete 50 quizzes' },
  { name: 'Quiz Legend',       icon: '👑', type: 'quizzes_completed', requirement: 100, rarity: 'legendary', description: 'Complete 100 quizzes' },
  { name: 'Sharp Shooter',    icon: '🎯', type: 'score_percentage',  requirement: 100, rarity: 'rare',      description: 'Score 100% on any quiz' },
  { name: 'Honor Roll',       icon: '⭐', type: 'score_percentage',  requirement: 80,  rarity: 'common',    description: 'Score 80% or higher on a quiz' },
  { name: 'On Fire',          icon: '🔥', type: 'streak',            requirement: 3,   rarity: 'common',    description: 'Maintain a 3-day streak' },
  { name: 'Streak Master',    icon: '💪', type: 'streak',            requirement: 7,   rarity: 'rare',      description: 'Maintain a 7-day streak' },
  { name: 'Unstoppable',      icon: '⚡', type: 'streak',            requirement: 30,  rarity: 'epic',      description: 'Maintain a 30-day streak' },
];

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  for (const a of ACHIEVEMENTS) {
    const result = await Achievement.findOneAndUpdate(
      { name: a.name },
      a,
      { upsert: true, new: true }
    );
    console.log(`✅ ${result.name} (${result.rarity})`);
  }

  console.log(`\nSeeded ${ACHIEVEMENTS.length} achievements`);
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
