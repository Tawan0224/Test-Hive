import { useEffect, useState } from 'react'

interface BattleHPBarProps {
  current: number
  max: number
  name: string
  side: 'left' | 'right'
  isHit: boolean
  icon?: string
}

const BattleHPBar = ({ current, max, name, side, isHit, icon }: BattleHPBarProps) => {
  const [displayHP, setDisplayHP] = useState(current)
  
  // Smoothly animate HP changes
  useEffect(() => {
    setDisplayHP(current)
  }, [current])

  const pct = Math.max(0, (displayHP / max) * 100)
  const barColor = pct > 60 
    ? 'from-green-500 to-green-400' 
    : pct > 30 
      ? 'from-yellow-500 to-yellow-400' 
      : 'from-red-500 to-red-400'
  
  const glowColor = pct > 60 
    ? 'shadow-green-500/40' 
    : pct > 30 
      ? 'shadow-yellow-500/40' 
      : 'shadow-red-500/40'

  return (
    <div 
      className={`flex flex-col ${side === 'left' ? 'items-start' : 'items-end'} gap-1.5
                  ${isHit ? 'animate-battle-hp-shake' : ''}`}
    >
      {/* Name & HP Value */}
      <div className={`flex items-center gap-2 ${side === 'right' ? 'flex-row-reverse' : ''}`}>
        {icon && <span className="text-lg">{icon}</span>}
        <span className="text-xs font-display font-bold text-white/90 tracking-wider uppercase">
          {name}
        </span>
        <span className="text-xs font-body text-white/40">
          {Math.max(0, Math.round(displayHP))}/{max}
        </span>
      </div>

      {/* HP Bar */}
      <div className="w-44 h-3.5 rounded-full bg-dark-700/80 border border-white/10 overflow-hidden relative">
        {/* Animated HP fill */}
        <div
          className={`h-full rounded-full bg-gradient-to-r ${barColor} transition-all duration-700 ease-out
                      relative shadow-lg ${glowColor}`}
          style={{ width: `${pct}%` }}
        >
          {/* Shine effect on top */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-b from-white/30 to-transparent" 
               style={{ height: '50%' }} />
        </div>

        {/* Low HP pulse effect */}
        {pct <= 25 && pct > 0 && (
          <div className="absolute inset-0 rounded-full bg-red-500/20 animate-pulse" />
        )}
      </div>
    </div>
  )
}

export default BattleHPBar