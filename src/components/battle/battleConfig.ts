// ─── BATTLE SYSTEM CONFIGURATION ─────────────────────────────────
// Shared constants for the quiz battle system

export const BATTLE_CONFIG = {
  // HP values
  BIRD_MAX_HP: 100,
  OCTOPUS_MAX_HP: 100,

  // Damage values
  BIRD_ATTACK_DAMAGE: 12,       // damage Bird deals to Octopus on correct answer
  OCTOPUS_ATTACK_DAMAGE: 10,    // damage Octopus deals to Bird on wrong answer
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

export type MascotState = 'idle' | 'attack' | 'hit' | 'victory' | 'defeat'