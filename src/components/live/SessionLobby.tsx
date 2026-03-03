import type { PlayerInfo } from '../../contexts/LiveSessionContext';

interface SessionLobbyProps {
  players: PlayerInfo[];
  quizTitle: string;
  questionCount: number;
}

const SessionLobby = ({ players, quizTitle, questionCount }: SessionLobbyProps) => {
  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Quiz info */}
      <div className="text-center mb-8">
        <h2 className="text-2xl sm:text-3xl font-display font-bold text-white mb-2">{quizTitle}</h2>
        <p className="text-white/50 font-body">{questionCount} questions</p>
      </div>

      {/* Player list */}
      <div className="bg-dark-800/60 backdrop-blur-sm border border-white/10 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-display font-bold text-white">Players</h3>
          <span className="text-sm font-body text-white/50">{players.length} joined</span>
        </div>

        {players.length === 0 ? (
          <p className="text-white/30 text-center py-8 font-body">Waiting for players to join...</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {players.map((player, i) => (
              <div
                key={player.userId}
                className="flex items-center gap-3 px-4 py-3 bg-white/5 rounded-lg border border-white/5
                           animate-[fadeSlideUp_0.3s_ease-out_forwards]"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <div className="w-8 h-8 rounded-full bg-hive-purple/30 flex items-center justify-center
                                text-sm font-bold text-hive-purple-light">
                  {(player.displayName || player.username).charAt(0).toUpperCase()}
                </div>
                <span className="text-white text-sm font-body truncate">
                  {player.displayName || player.username}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SessionLobby;
