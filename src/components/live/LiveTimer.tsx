interface LiveTimerProps {
  remaining: number;
  total: number;
  isPaused?: boolean;
}

const LiveTimer = ({ remaining, total, isPaused }: LiveTimerProps) => {
  const pct = total > 0 ? (remaining / total) * 100 : 0;

  const barColor = pct > 60
    ? 'from-green-500 to-green-400'
    : pct > 30
      ? 'from-yellow-500 to-yellow-400'
      : 'from-red-500 to-red-400';

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-body text-white/50">
          {isPaused ? 'PAUSED' : 'Time Left'}
        </span>
        <span className={`text-lg font-mono font-bold ${remaining <= 5 ? 'text-red-400 animate-pulse' : 'text-white'}`}>
          {remaining}s
        </span>
      </div>
      <div className="w-full h-2.5 rounded-full bg-dark-700/80 border border-white/10 overflow-hidden">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${barColor} transition-all duration-1000 ease-linear`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
};

export default LiveTimer;
