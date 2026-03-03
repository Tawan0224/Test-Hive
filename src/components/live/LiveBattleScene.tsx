import { useState, useEffect, useRef, useCallback } from 'react';
import QuizBirdMascot from '../three/QuizBirdMascot';
import QuizOctopusMascot from '../three/QuizOctopusMascot';
import BattleHPBar from '../battle/BattleHPBar';
import { ScreenFlash, DamageNumber } from '../battle/BattleEffects';
import type { MascotState } from '../battle/battleConfig';

interface LiveBattleSceneProps {
  birdState: MascotState;
  bossState: MascotState;
  birdHP: number;
  bossHP: number;
  bossMaxHP: number;
  bossDamageDealt?: number;
  correctCount?: number;
  wrongCount?: number;
  collectiveBonus?: number;
  showResults?: boolean;
  flashType?: 'correct' | 'wrong' | null;
}

const LiveBattleScene = ({
  birdState,
  bossState,
  birdHP,
  bossHP,
  bossMaxHP,
  bossDamageDealt = 0,
  correctCount = 0,
  wrongCount = 0,
  collectiveBonus = 0,
  showResults = false,
  flashType = null,
}: LiveBattleSceneProps) => {
  const [damageNumbers, setDamageNumbers] = useState<Array<{
    id: number; x: number; y: number; damage: number; isPlayerAttack: boolean;
  }>>([]);
  const [flash, setFlash] = useState<'correct' | 'wrong' | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const lastResultsRef = useRef<number>(0);

  // Handle flash from parent
  useEffect(() => {
    if (flashType) {
      setFlash(flashType);
      const t = setTimeout(() => setFlash(null), 600);
      return () => clearTimeout(t);
    }
  }, [flashType]);

  // Spawn damage numbers when results come in
  useEffect(() => {
    if (!showResults || bossDamageDealt === 0) return;
    const now = Date.now();
    if (now - lastResultsRef.current < 500) return; // debounce
    lastResultsRef.current = now;

    // Boss damage number (right side, near octopus)
    setDamageNumbers(prev => [...prev, {
      id: now,
      x: (containerRef.current?.offsetWidth ?? 600) * 0.75,
      y: 80,
      damage: bossDamageDealt,
      isPlayerAttack: true,
    }]);

    // Cleanup after animation
    setTimeout(() => {
      setDamageNumbers(prev => prev.filter(dn => Date.now() - dn.id < 1000));
    }, 1500);
  }, [showResults, bossDamageDealt]);

  return (
    <div ref={containerRef} className="relative w-full overflow-visible">
      {/* Screen flash overlay */}
      <ScreenFlash type={flash} />

      {/* HP Bars row */}
      <div className="flex items-start justify-between px-2 mb-2">
        <BattleHPBar
          current={birdHP}
          max={100}
          name="Players"
          side="left"
          isHit={birdState === 'hit'}
          icon="🐦"
        />
        <BattleHPBar
          current={bossHP}
          max={bossMaxHP}
          name="Boss"
          side="right"
          isHit={bossState === 'hit'}
          icon="🐙"
        />
      </div>

      {/* Mascots row */}
      <div className="flex items-center justify-between h-[200px] sm:h-[260px] lg:h-[300px]">
        {/* Bird (left) */}
        <div className="w-[45%] h-full overflow-visible pointer-events-none">
          <QuizBirdMascot battleState={birdState} />
        </div>

        {/* Center info */}
        {showResults && (correctCount > 0 || wrongCount > 0) && (
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-30
                          flex flex-col items-center gap-1 pointer-events-none">
            {correctCount > 0 && (
              <span className="text-green-400 font-display font-bold text-sm sm:text-base
                             bg-dark-900/60 px-3 py-1 rounded-full backdrop-blur-sm">
                {correctCount} correct!
              </span>
            )}
            {wrongCount > 0 && (
              <span className="text-red-400 font-display font-bold text-sm sm:text-base
                             bg-dark-900/60 px-3 py-1 rounded-full backdrop-blur-sm">
                {wrongCount} wrong
              </span>
            )}
            {collectiveBonus > 0 && (
              <span className="text-yellow-400 font-display font-bold text-xs sm:text-sm
                             bg-yellow-400/10 px-3 py-1 rounded-full backdrop-blur-sm border border-yellow-400/30
                             animate-pulse">
                ALL CORRECT! +{collectiveBonus} bonus dmg
              </span>
            )}
          </div>
        )}

        {/* Octopus (right) */}
        <div className="w-[45%] h-full overflow-visible pointer-events-none">
          <QuizOctopusMascot battleState={bossState} />
        </div>
      </div>

      {/* Damage numbers overlay */}
      {damageNumbers.map(dn => (
        <DamageNumber
          key={dn.id}
          x={dn.x}
          y={dn.y}
          damage={dn.damage}
          isPlayerAttack={dn.isPlayerAttack}
        />
      ))}
    </div>
  );
};

export default LiveBattleScene;
