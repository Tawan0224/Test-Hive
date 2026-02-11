// ─── BATTLE SYSTEM CONFIGURATION ─────────────────────────────────
// Shared constants for the quiz battle system

export const BATTLE_CONFIG = {
  // HP values (base - used as max for both mascots)
  BIRD_MAX_HP: 100,
  OCTOPUS_MAX_HP: 100,

  // Damage values (these are now FALLBACK defaults only)
  // Actual damage is calculated dynamically based on question count
  BIRD_ATTACK_DAMAGE: 12,       // fallback damage Bird deals to Octopus on correct answer
  OCTOPUS_ATTACK_DAMAGE: 10,    // fallback damage Octopus deals to Bird on wrong answer
  COMBO_BONUS_DAMAGE: 4,        // extra damage at 3+ combo

  // Timing (ms)
  ATTACK_ANIMATION_DURATION: 600,
  HIT_ANIMATION_DURATION: 500,
  NEXT_QUESTION_DELAY: 1200,    // delay before moving to next question after answer

  // Mascot animation states
  STATES: {
    IDLE: 'idle' as const,
    ATTACK: 'attack' as const,
    HIT: 'hit' as const,
    VICTORY: 'victory' as const,
    DEFEAT: 'defeat' as const,
  },
}

/**
 * Calculate dynamic damage values based on total number of questions.
 * This ensures HP bars accurately reflect quiz progress:
 * - Getting ALL correct = Octopus HP goes to 0
 * - Getting ALL wrong = Bird HP goes to 0
 */
export function getDynamicDamage(totalQuestions: number) {
  const birdDamagePerCorrect = Math.floor(BATTLE_CONFIG.OCTOPUS_MAX_HP / totalQuestions)
  const octopusDamagePerWrong = Math.floor(BATTLE_CONFIG.BIRD_MAX_HP / totalQuestions)

  return {
    birdAttackDamage: Math.max(1, birdDamagePerCorrect),
    octopusAttackDamage: Math.max(1, octopusDamagePerWrong),
    // Combo bonus scales too — smaller for large quizzes, bigger for small
    comboBonusDamage: Math.max(1, Math.floor(birdDamagePerCorrect * 0.3)),
  }
}

export type MascotState = 'idle' | 'attack' | 'hit' | 'victory' | 'defeat'