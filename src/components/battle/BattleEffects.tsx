import { useState, useEffect, useRef, useCallback } from 'react'

// ─── TYPES ───────────────────────────────────────────────────────
export type BattleAction = {
  id: number
  type: 'correct' | 'wrong'
  damage: number
  timestamp: number
}

interface BattleEffectsProps {
  lastAction: BattleAction | null
  comboCount: number
  birdSide?: 'left' | 'right'
}

// ─── ATTACK PARTICLE ─────────────────────────────────────────────
const AttackParticle = ({ 
  fromX, fromY, toX, toY, color, delay, onDone 
}: { 
  fromX: number; fromY: number; toX: number; toY: number
  color: string; delay: number; onDone: () => void 
}) => {
  const [pos, setPos] = useState({ x: fromX, y: fromY, opacity: 0, scale: 0.5 })
  const frameRef = useRef<number>(0)
  const startRef = useRef<number | null>(null)

  useEffect(() => {
    const timeout = setTimeout(() => {
      const animate = (ts: number) => {
        if (!startRef.current) startRef.current = ts
        const elapsed = ts - startRef.current
        const duration = 450
        const p = Math.min(elapsed / duration, 1)
        const eased = 1 - Math.pow(1 - p, 3) // ease-out cubic

        setPos({
          x: fromX + (toX - fromX) * eased,
          y: fromY + (toY - fromY) * eased + Math.sin(p * Math.PI) * -50,
          opacity: p < 0.75 ? Math.min(p * 4, 1) : 1 - (p - 0.75) / 0.25,
          scale: 0.5 + Math.sin(p * Math.PI) * 0.8,
        })

        if (p < 1) {
          frameRef.current = requestAnimationFrame(animate)
        } else {
          onDone()
        }
      }
      frameRef.current = requestAnimationFrame(animate)
    }, delay)

    return () => {
      clearTimeout(timeout)
      if (frameRef.current) cancelAnimationFrame(frameRef.current)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div
      className="absolute pointer-events-none z-50"
      style={{
        left: pos.x,
        top: pos.y,
        opacity: pos.opacity,
        transform: `translate(-50%, -50%) scale(${pos.scale})`,
      }}
    >
      <div 
        className="w-5 h-5 rounded-full blur-sm"
        style={{
          background: `radial-gradient(circle, ${color}, transparent)`,
          boxShadow: `0 0 16px ${color}, 0 0 32px ${color}50`,
        }}
      />
    </div>
  )
}

// ─── IMPACT BURST ────────────────────────────────────────────────
const ImpactBurst = ({ x, y, color }: { x: number; y: number; color: string }) => {
  return (
    <div 
      className="absolute pointer-events-none z-45 animate-battle-impact"
      style={{ left: x, top: y, transform: 'translate(-50%, -50%)' }}
    >
      {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
        <div
          key={deg}
          className="absolute w-1 h-4 rounded-full"
          style={{
            background: color,
            transform: `rotate(${deg}deg) translateY(-16px)`,
            transformOrigin: 'center bottom',
            boxShadow: `0 0 8px ${color}`,
          }}
        />
      ))}
    </div>
  )
}

// ─── DAMAGE NUMBER ───────────────────────────────────────────────
const DamageNumber = ({ x, y, damage, isPlayerAttack }: { 
  x: number; y: number; damage: number; isPlayerAttack: boolean 
}) => {
  return (
    <div
      className="absolute pointer-events-none z-50 animate-battle-damage-float"
      style={{ left: x, top: y, transform: 'translate(-50%, -50%)' }}
    >
      <span 
        className="font-display font-black text-xl"
        style={{
          color: isPlayerAttack ? '#a855f7' : '#ef4444',
          textShadow: isPlayerAttack 
            ? '0 0 20px rgba(168,85,247,0.8), 0 2px 4px rgba(0,0,0,0.5)' 
            : '0 0 20px rgba(239,68,68,0.8), 0 2px 4px rgba(0,0,0,0.5)',
        }}
      >
        -{damage}
      </span>
    </div>
  )
}

// ─── COMBO INDICATOR ─────────────────────────────────────────────
const ComboIndicator = ({ count }: { count: number }) => {
  if (count < 2) return null
  
  return (
    <div className="absolute top-16 left-1/2 -translate-x-1/2 z-50 animate-battle-combo-pop pointer-events-none">
      <div className="flex items-center gap-2 px-4 py-2 rounded-full
                      bg-gradient-to-r from-amber-500/20 to-orange-500/20
                      border border-amber-500/40 backdrop-blur-sm">
        <span className="text-amber-400 font-display font-black text-sm tracking-wider">
          🔥 {count}x COMBO
        </span>
        {count >= 3 && (
          <span className="text-amber-300/80 font-body text-xs">+BONUS DMG</span>
        )}
      </div>
    </div>
  )
}

// ─── SCREEN FLASH ────────────────────────────────────────────────
const ScreenFlash = ({ type }: { type: 'correct' | 'wrong' | null }) => {
  if (!type) return null
  
  return (
    <div 
      className="absolute inset-0 pointer-events-none z-40 animate-battle-flash"
      style={{
        background: type === 'correct'
          ? 'radial-gradient(ellipse at center, rgba(34,197,94,0.12) 0%, transparent 70%)'
          : 'radial-gradient(ellipse at center, rgba(239,68,68,0.12) 0%, transparent 70%)',
      }}
    />
  )
}

// ─── MAIN BATTLE EFFECTS COMPONENT ──────────────────────────────
const BattleEffects = ({ lastAction, comboCount }: BattleEffectsProps) => {
  const [particles, setParticles] = useState<Array<{
    id: number; fromX: number; fromY: number; toX: number; toY: number
    color: string; delay: number
  }>>([])
  const [impacts, setImpacts] = useState<Array<{
    id: number; x: number; y: number; color: string
  }>>([])
  const [damageNumbers, setDamageNumbers] = useState<Array<{
    id: number; x: number; y: number; damage: number; isPlayerAttack: boolean
  }>>([])
  const [flash, setFlash] = useState<'correct' | 'wrong' | null>(null)
  const [showCombo, setShowCombo] = useState(false)
  const processedRef = useRef<number>(0)

  useEffect(() => {
    if (!lastAction || lastAction.id === processedRef.current) return
    processedRef.current = lastAction.id

    const isCorrect = lastAction.type === 'correct'
    
    // Bird attacks right (octopus) on correct, Octopus attacks left (bird) on wrong
    const fromX = isCorrect ? 80 : 720
    const toX = isCorrect ? 720 : 80
    const centerY = 180

    // Screen flash
    setFlash(isCorrect ? 'correct' : 'wrong')
    setTimeout(() => setFlash(null), 600)

    // Spawn particles (3 per attack)
    const newParticles = Array.from({ length: 4 }, (_, i) => ({
      id: Date.now() + i,
      fromX: fromX + (Math.random() - 0.5) * 30,
      fromY: centerY + (Math.random() - 0.5) * 40,
      toX: toX + (Math.random() - 0.5) * 40,
      toY: centerY + (Math.random() - 0.5) * 50,
      color: isCorrect ? '#a855f7' : '#ef4444',
      delay: i * 50,
    }))
    setParticles(prev => [...prev, ...newParticles])

    // Impact burst at target (delayed to match particle arrival)
    setTimeout(() => {
      setImpacts(prev => [...prev, {
        id: Date.now(),
        x: toX,
        y: centerY,
        color: isCorrect ? '#a855f7' : '#ef4444',
      }])

      // Damage number
      setDamageNumbers(prev => [...prev, {
        id: Date.now() + 1,
        x: toX + (Math.random() - 0.5) * 30,
        y: centerY - 30,
        damage: lastAction.damage,
        isPlayerAttack: isCorrect,
      }])
    }, 350)

    // Combo
    if (isCorrect && comboCount >= 2) {
      setShowCombo(true)
      setTimeout(() => setShowCombo(false), 1200)
    }

    // Cleanup old effects
    setTimeout(() => {
      setImpacts(prev => prev.filter(imp => Date.now() - imp.id < 500))
      setDamageNumbers(prev => prev.filter(dn => Date.now() - dn.id < 1000))
    }, 1500)
  }, [lastAction, comboCount])

  const removeParticle = useCallback((id: number) => {
    setParticles(prev => prev.filter(p => p.id !== id))
  }, [])

  return (
    <>
      <ScreenFlash type={flash} />
      
      {showCombo && <ComboIndicator count={comboCount} />}

      {particles.map(p => (
        <AttackParticle
          key={p.id}
          fromX={p.fromX}
          fromY={p.fromY}
          toX={p.toX}
          toY={p.toY}
          color={p.color}
          delay={p.delay}
          onDone={() => removeParticle(p.id)}
        />
      ))}

      {impacts.map(imp => (
        <ImpactBurst key={imp.id} x={imp.x} y={imp.y} color={imp.color} />
      ))}

      {damageNumbers.map(dn => (
        <DamageNumber 
          key={dn.id} 
          x={dn.x} 
          y={dn.y} 
          damage={dn.damage} 
          isPlayerAttack={dn.isPlayerAttack} 
        />
      ))}
    </>
  )
}

export default BattleEffects
export { ComboIndicator, ScreenFlash, ImpactBurst, DamageNumber }