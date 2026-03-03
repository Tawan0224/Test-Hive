import { useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useLiveSession } from '../contexts/LiveSessionContext';
import { useAuth } from '../contexts/AuthContext';
import {
  SessionCodeDisplay,
  SessionLobby,
  LiveQuestionCard,
  LiveAnswerGrid,
  LiveTimer,
  LiveScoreboard,
  LiveBossHPBar,
} from '../components/live';
import Button from '../components/ui/Button';

const LiveSessionHost = () => {
  const { sessionCode } = useParams<{ sessionCode: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { state, actions } = useLiveSession();

  // Read quiz info passed from HomePage navigation
  const navState = location.state as { quizTitle?: string; questionCount?: number } | null;

  // On mount, join the socket room as host via context
  useEffect(() => {
    if (!sessionCode) return;
    actions.initAsHost(sessionCode, navState?.quizTitle || '', navState?.questionCount || 0);
  }, [sessionCode]);

  const handleLeave = () => {
    actions.leaveSession();
    navigate('/home');
  };

  if (!sessionCode) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-white/50">Invalid session</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-8 sm:py-12">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-xl sm:text-2xl font-display font-bold text-white">
            Live Session
          </h1>
          <button
            onClick={handleLeave}
            className="text-sm text-white/50 hover:text-red-400 font-body transition-colors"
          >
            End Session
          </button>
        </div>

        {/* ─── LOBBY PHASE ─── */}
        {(state.status === 'idle' || state.status === 'lobby') && (
          <div className="space-y-8">
            <SessionCodeDisplay code={sessionCode} />

            <SessionLobby
              players={state.players}
              quizTitle={state.quizTitle}
              questionCount={state.questionCount}
            />

            <div className="flex justify-center">
              <Button
                onClick={actions.startSession}
                disabled={state.players.length === 0}
                className="px-10 py-4 text-lg"
              >
                {state.players.length === 0
                  ? 'Waiting for players...'
                  : `Start Game (${state.players.length} players)`}
              </Button>
            </div>
          </div>
        )}

        {/* ─── ACTIVE / PAUSED PHASE ─── */}
        {(state.status === 'active' || state.status === 'paused') && state.currentQuestion && (
          <div className="space-y-6">
            {/* Boss HP */}
            <LiveBossHPBar
              current={state.bossHP}
              max={state.bossMaxHP}
            />

            {/* Timer */}
            <LiveTimer
              remaining={state.timerRemaining}
              total={state.currentQuestion.timeLimit}
              isPaused={state.status === 'paused'}
            />

            {/* Question (read-only for host) */}
            <LiveQuestionCard
              index={state.currentQuestion.index}
              totalQuestions={state.currentQuestion.totalQuestions}
              questionText={state.currentQuestion.questionText}
            />

            {/* Options (read-only display for host) */}
            <LiveAnswerGrid
              options={state.currentQuestion.options}
              onAnswer={() => {}}
              disabled={true}
              selectedOption={null}
            />

            {/* Answer count + controls */}
            <div className="flex items-center justify-between">
              <p className="text-white/50 font-body">
                Answers: <span className="text-white font-bold">{state.answerCount}</span> / {state.totalPlayers}
              </p>
              <div className="flex gap-3">
                {state.status === 'paused' ? (
                  <Button onClick={actions.resumeSession} className="px-6 py-2">
                    Resume
                  </Button>
                ) : (
                  <Button onClick={actions.pauseSession} className="px-6 py-2">
                    Pause
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ─── RESULTS PHASE (between questions) ─── */}
        {state.status === 'results' && state.lastResults && (
          <div className="space-y-6">
            {/* Boss HP */}
            <LiveBossHPBar
              current={state.bossHP}
              max={state.bossMaxHP}
              isHit={true}
            />

            {state.lastResults.bossDefeated && (
              <div className="text-center py-4">
                <p className="text-3xl font-display font-bold text-green-400 animate-pulse">
                  Boss Defeated!
                </p>
              </div>
            )}

            {/* Boss damage dealt */}
            <div className="text-center">
              <p className="text-white/50 font-body text-sm">
                Damage dealt: <span className="text-red-400 font-bold">{state.lastResults.bossDamageDealt}</span>
              </p>
            </div>

            {/* Correct answer reveal */}
            {state.currentQuestion && (
              <LiveAnswerGrid
                options={state.currentQuestion.options}
                onAnswer={() => {}}
                disabled={true}
                selectedOption={null}
                correctOptionIndex={state.lastResults.correctOptionIndex}
              />
            )}

            {/* Scoreboard */}
            <LiveScoreboard
              players={state.players}
              currentUserId={user?._id}
            />

            {/* Next button */}
            <div className="flex justify-center">
              {state.lastResults.isLastQuestion || state.lastResults.bossDefeated ? (
                <Button onClick={actions.nextQuestion} className="px-10 py-3">
                  See Final Results
                </Button>
              ) : (
                <Button onClick={actions.nextQuestion} className="px-10 py-3">
                  Next Question
                </Button>
              )}
            </div>
          </div>
        )}

        {/* ─── COMPLETED PHASE ─── */}
        {state.status === 'completed' && state.completedData && (
          <div className="space-y-8">
            {/* Boss outcome */}
            <div className="text-center py-6">
              {state.completedData.bossDefeated ? (
                <>
                  <p className="text-4xl sm:text-5xl font-display font-bold text-green-400 mb-2">
                    Victory!
                  </p>
                  <p className="text-white/60 font-body">The boss has been defeated!</p>
                </>
              ) : (
                <>
                  <p className="text-4xl sm:text-5xl font-display font-bold text-red-400 mb-2">
                    Defeated...
                  </p>
                  <p className="text-white/60 font-body">
                    The boss survived with {state.completedData.bossHP}/{state.completedData.bossMaxHP} HP
                  </p>
                </>
              )}
            </div>

            {/* Boss HP bar */}
            <LiveBossHPBar current={state.bossHP} max={state.bossMaxHP} />

            {/* Final scoreboard */}
            <LiveScoreboard
              players={state.players}
              currentUserId={user?._id}
            />

            <div className="flex justify-center">
              <Button onClick={() => navigate('/home')} className="px-8 py-3">
                Back to Home
              </Button>
            </div>
          </div>
        )}

        {/* ─── ERROR ─── */}
        {state.status === 'error' && (
          <div className="text-center py-12">
            <p className="text-red-400 font-body mb-4">{state.error}</p>
            <Button onClick={() => navigate('/home')}>Back to Home</Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveSessionHost;
