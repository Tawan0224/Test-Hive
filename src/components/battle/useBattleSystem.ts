import { useState, useCallback, useRef } from 'react'
import { BATTLE_CONFIG, type MascotState } from './battleConfig'
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
}

interface BattleActions {
  triggerCorrectAnswer: () => void
  triggerWrongAnswer: () => void
  resetBattle: () => void
}

const useBattleSystem = (): [BattleState, BattleActions] => {
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

  const triggerCorrectAnswer = useCallback(() => {
    const newCombo = comboCount + 1
    setComboCount(newCombo)
    
    const damage = BATTLE_CONFIG.BIRD_ATTACK_DAMAGE + 
      (newCombo >= 3 ? BATTLE_CONFIG.COMBO_BONUS_DAMAGE : 0)

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
  }, [comboCount])

  const triggerWrongAnswer = useCallback(() => {
    setComboCount(0)
    
    const damage = BATTLE_CONFIG.OCTOPUS_ATTACK_DAMAGE

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
  }, [])

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
  }

  const actions: BattleActions = {
    triggerCorrectAnswer,
    triggerWrongAnswer,
    resetBattle,
  }

  return [state, actions]
}

export default useBattleSystem