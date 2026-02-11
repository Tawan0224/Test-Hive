import { useState, useCallback, useRef, useMemo } from 'react'
import { BATTLE_CONFIG, getDynamicDamage, type MascotState } from './battleConfig'
import type { BattleAction } from './BattleEffects'

interface BattleState {
  birdHP: number
  octopusHP: number
  birdState: MascotState
  octopusState: MascotState
  comboCount: number
  lastAction: BattleAction | null
  screenShake: boolean
  isBirdHit: boolean
  isOctopusHit: boolean
  birdDefeated: boolean
  octopusDefeated: boolean
}

interface BattleActions {
  triggerCorrectAnswer: () => void
  triggerWrongAnswer: () => void
  resetBattle: () => void
}

/**
 * @param totalQuestions - The total number of questions in the quiz.
 *   Used to scale damage so HP bars accurately reflect progress.
 *   If not provided, falls back to default config values.
 */
const useBattleSystem = (totalQuestions?: number): [BattleState, BattleActions] => {
  const [birdHP, setBirdHP] = useState(BATTLE_CONFIG.BIRD_MAX_HP)
  const [octopusHP, setOctopusHP] = useState(BATTLE_CONFIG.OCTOPUS_MAX_HP)
  const [birdState, setBirdState] = useState<MascotState>('idle')
  const [octopusState, setOctopusState] = useState<MascotState>('idle')
  const [comboCount, setComboCount] = useState(0)
  const [lastAction, setLastAction] = useState<BattleAction | null>(null)
  const [screenShake, setScreenShake] = useState(false)
  const [isBirdHit, setIsBirdHit] = useState(false)
  const [isOctopusHit, setIsOctopusHit] = useState(false)
  const actionIdRef = useRef(0)

  // Calculate dynamic damage based on question count
  const dynamicDamage = useMemo(() => {
    if (totalQuestions && totalQuestions > 0) {
      return getDynamicDamage(totalQuestions)
    }
    return {
      birdAttackDamage: BATTLE_CONFIG.BIRD_ATTACK_DAMAGE,
      octopusAttackDamage: BATTLE_CONFIG.OCTOPUS_ATTACK_DAMAGE,
      comboBonusDamage: BATTLE_CONFIG.COMBO_BONUS_DAMAGE,
    }
  }, [totalQuestions])

  const triggerCorrectAnswer = useCallback(() => {
    const newCombo = comboCount + 1
    setComboCount(newCombo)
    
    const damage = dynamicDamage.birdAttackDamage + 
      (newCombo >= 3 ? dynamicDamage.comboBonusDamage : 0)

    // Bird attacks
    setBirdState('attack')

    // After a short delay, octopus gets hit
    setTimeout(() => {
      setOctopusState('hit')
      setIsOctopusHit(true)
      setOctopusHP(prev => Math.max(0, prev - damage))
      setScreenShake(true)
    }, 250)

    // Create action for effects
    actionIdRef.current += 1
    setLastAction({
      id: actionIdRef.current,
      type: 'correct',
      damage,
      timestamp: Date.now(),
    })

    // Reset to idle
    setTimeout(() => {
      setBirdState('idle')
      setOctopusState('idle')
      setScreenShake(false)
      setIsOctopusHit(false)
    }, BATTLE_CONFIG.ATTACK_ANIMATION_DURATION)
  }, [comboCount, dynamicDamage])

  const triggerWrongAnswer = useCallback(() => {
    setComboCount(0)
    
    const damage = dynamicDamage.octopusAttackDamage

    // Octopus attacks
    setOctopusState('attack')

    // After a short delay, bird gets hit
    setTimeout(() => {
      setBirdState('hit')
      setIsBirdHit(true)
      setBirdHP(prev => Math.max(0, prev - damage))
      setScreenShake(true)
    }, 250)

    // Create action for effects
    actionIdRef.current += 1
    setLastAction({
      id: actionIdRef.current,
      type: 'wrong',
      damage,
      timestamp: Date.now(),
    })

    // Reset to idle
    setTimeout(() => {
      setBirdState('idle')
      setOctopusState('idle')
      setScreenShake(false)
      setIsBirdHit(false)
    }, BATTLE_CONFIG.ATTACK_ANIMATION_DURATION)
  }, [dynamicDamage])

  const resetBattle = useCallback(() => {
    setBirdHP(BATTLE_CONFIG.BIRD_MAX_HP)
    setOctopusHP(BATTLE_CONFIG.OCTOPUS_MAX_HP)
    setBirdState('idle')
    setOctopusState('idle')
    setComboCount(0)
    setLastAction(null)
    setScreenShake(false)
    setIsBirdHit(false)
    setIsOctopusHit(false)
  }, [])

  const state: BattleState = {
    birdHP,
    octopusHP,
    birdState,
    octopusState,
    comboCount,
    lastAction,
    screenShake,
    isBirdHit,
    isOctopusHit,
    birdDefeated: birdHP <= 0,
    octopusDefeated: octopusHP <= 0,
  }

  const actions: BattleActions = {
    triggerCorrectAnswer,
    triggerWrongAnswer,
    resetBattle,
  }

  return [state, actions]
}

export default useBattleSystem