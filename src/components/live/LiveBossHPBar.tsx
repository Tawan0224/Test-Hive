import BattleHPBar from '../battle/BattleHPBar';

interface LiveBossHPBarProps {
  current: number;
  max: number;
  isHit?: boolean;
}

const LiveBossHPBar = ({ current, max, isHit = false }: LiveBossHPBarProps) => {
  return (
    <div className="w-full flex justify-center">
      <BattleHPBar
        current={current}
        max={max}
        name="Boss"
        side="right"
        isHit={isHit}
        icon=""
      />
    </div>
  );
};

export default LiveBossHPBar;
