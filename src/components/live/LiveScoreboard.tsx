import type { PlayerInfo } from '../../contexts/LiveSessionContext';

interface LiveScoreboardProps {
  players: PlayerInfo[];
  currentUserId?: string;
  maxDisplay?: number;
}

const LiveScoreboard = ({ players, currentUserId, maxDisplay = 10 }: LiveScoreboardProps) => {
  const sorted = [...players].sort((a, b) => b.score - a.score);
  const displayed = sorted.slice(0, maxDisplay);

  return (
    <div className="w-full">
      <h3 className="text-lg font-display font-bold text-white mb-4">Scoreboard</h3>
      <div className="space-y-2">
        {displayed.map((player, i) => {
          const isMe = player.userId === currentUserId;
          const rank = i + 1;

          return (
            <div
              key={player.userId}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg border transition-all
                ${isMe
                  ? 'bg-hive-purple/20 border-hive-purple/40'
                  : 'bg-white/5 border-white/5'
                }`}
            >
              {/* Rank */}
              <span className={`w-8 text-center font-mono font-bold text-lg
                ${rank === 1 ? 'text-yellow-400' : rank === 2 ? 'text-gray-300' : rank === 3 ? 'text-amber-600' : 'text-white/40'}`}>
                {rank}
              </span>

              {/* Name */}
              <div className="flex-1 min-w-0">
                <span className={`text-sm font-body truncate block ${isMe ? 'text-white font-bold' : 'text-white/80'}`}>
                  {player.displayName || player.username}
                  {isMe && <span className="text-hive-purple-light ml-1">(You)</span>}
                </span>
              </div>

              {/* HP bar */}
              <div className="w-16 h-2 rounded-full bg-dark-700 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    player.hp > 60 ? 'bg-green-500' : player.hp > 30 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${player.hp}%` }}
                />
              </div>

              {/* Score */}
              <span className="text-white font-mono font-bold text-sm w-16 text-right">
                {player.score}
              </span>

              {/* Correct indicator */}
              {player.answeredCorrectly !== undefined && (
                <span className={`text-lg ${player.answeredCorrectly ? 'text-green-400' : 'text-red-400'}`}>
                  {player.answeredCorrectly ? '\u2713' : '\u2717'}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default LiveScoreboard;
