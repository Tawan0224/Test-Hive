import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLiveSession } from '../contexts/LiveSessionContext';
import { useAuth } from '../contexts/AuthContext';
import {
  SessionLobby,
  LiveQuestionCard,
  LiveAnswerGrid,
  LiveTimer,
  LiveScoreboard,
  LiveBattleScene,
} from '../components/live';
import Button from '../components/ui/Button';
import { playCorrectSound, playWrongSound, playHitSound, playVictorySound, playDefeatSound, playBonusSound } from '../utils/sounds';

const PHASE_DURATION = 800; // ms per animation phase

const LiveSessionPlay = () => {
  const { code: urlCode } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { state, actions } = useLiveSession();

  const [joinCode, setJoinCode] = useState(urlCode || '');
  const [joinError, setJoinError] = useState('');
  const [joining, setJoining] = useState(false);
  const [flashType, setFlashType] = useState<'correct' | 'wrong' | null>(null);
  const sequencerRef = useRef<number>(0);

  // Auto-join if code is in URL
  useEffect(() => {
    if (urlCode && state.status === 'idle') {
      handleJoin(urlCode);
    }
  }, [urlCode]);

  // Two-phase battle animation sequencer
  useEffect(() => {
    if (state.status !== 'results' || !state.lastResults) return;

    const { correctCount, wrongCount, bossDamageDealt } = state.lastResults;
    const myResult = state.lastResults.scoreboard.find(p => p.userId === user?._id);

    // Clear any previous sequence
    sequencerRef.current++;
    const seqId = sequencerRef.current;

    let delay = 200; // small initial delay

    // Phase 1: Bird attacks boss (if anyone got it right)
    if (correctCount > 0) {
      setTimeout(() => {
        if (sequencerRef.current !== seqId) return;
        actions.setBirdState('attack');
        actions.setBossState('hit');
        playHitSound();
        if (myResult?.answeredCorrectly) {
          setFlashType('correct');
          playCorrectSound();
        }
        if (state.lastResults?.collectiveBonus) {
          setTimeout(() => playBonusSound(), 300);
        }
      }, delay);
      delay += PHASE_DURATION;

      // Reset after phase 1
      setTimeout(() => {
        if (sequencerRef.current !== seqId) return;
        actions.setBirdState('idle');
        actions.setBossState('idle');
        setFlashType(null);
      }, delay);
      delay += 200; // brief gap between phases
    }

    // Phase 2: Boss retaliates (if anyone got it wrong)
    if (wrongCount > 0) {
      setTimeout(() => {
        if (sequencerRef.current !== seqId) return;
        actions.setBossState('attack');
        actions.setBirdState('hit');
        if (!myResult?.answeredCorrectly) {
          setFlashType('wrong');
          playWrongSound();
        }
      }, delay);
      delay += PHASE_DURATION;

      // Reset after phase 2
      setTimeout(() => {
        if (sequencerRef.current !== seqId) return;
        actions.setBossState('idle');
        actions.setBirdState('idle');
        setFlashType(null);
      }, delay);
    }

    return () => { sequencerRef.current++; };
  }, [state.lastResults]);

  // Victory/defeat sound on completion
  useEffect(() => {
    if (state.status !== 'completed' || !state.completedData) return;
    if (state.completedData.bossDefeated) {
      playVictorySound();
    } else {
      playDefeatSound();
    }
  }, [state.status]);

  const handleJoin = async (code?: string) => {
    const codeToUse = code || joinCode.trim();
    if (!codeToUse) return;

    setJoinError('');
    setJoining(true);

    const result = await actions.joinSession(codeToUse.toUpperCase());
    setJoining(false);

    if (!result.success) {
      setJoinError(result.error || 'Failed to join session');
    }
  };

  const handleLeave = () => {
    actions.leaveSession();
    navigate('/home');
  };

  // Find current user's data from the players list
  const myData = state.players.find(p => p.userId === user?._id);

  return (
    <div className="min-h-screen px-4 py-8 sm:py-12">
      <div className="max-w-3xl mx-auto">

        {/* ─── JOIN PHASE ─── */}
        {(state.status === 'idle' || state.status === 'connecting') && !urlCode && (
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <h1 className="text-3xl sm:text-4xl font-display font-bold text-white mb-8">
              Join Live Session
            </h1>
            <div className="w-full max-w-md space-y-4">
              <input
                type="text"
                placeholder="Enter session code"
                maxLength={6}
                value={joinCode}
                onChange={(e) => { setJoinCode(e.target.value.toUpperCase()); setJoinError(''); }}
                onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
                className="w-full px-6 py-4 bg-dark-700/50 border border-white/10 rounded-xl
                          text-white placeholder-white/30 font-mono text-2xl tracking-[0.3em] text-center
                          focus:outline-none focus:border-hive-blue/50 focus:ring-2 focus:ring-hive-blue/20
                          transition-all duration-300 uppercase"
              />
              <Button
                onClick={() => handleJoin()}
                disabled={joining || !joinCode.trim()}
                className="w-full py-4 text-lg"
              >
                {joining ? 'Joining...' : 'Join Session'}
              </Button>
              {joinError && (
                <p className="text-red-400 text-sm text-center font-body">{joinError}</p>
              )}
            </div>
          </div>
        )}

        {/* Loading state for URL join */}
        {state.status === 'connecting' && urlCode && (
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <p className="text-white/50 font-body text-lg">Joining session...</p>
          </div>
        )}

        {/* ─── LOBBY PHASE ─── */}
        {state.status === 'lobby' && (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <h1 className="text-xl sm:text-2xl font-display font-bold text-white">
                Waiting for Host
              </h1>
              <button
                onClick={handleLeave}
                className="text-sm text-white/50 hover:text-red-400 font-body transition-colors"
              >
                Leave
              </button>
            </div>

            <SessionLobby
              players={state.players}
              quizTitle={state.quizTitle}
              questionCount={state.questionCount}
            />

            <div className="text-center">
              <p className="text-white/40 font-body animate-pulse">
                Waiting for the host to start the game...
              </p>
            </div>
          </div>
        )}

        {/* ─── ACTIVE / PAUSED PHASE ─── */}
        {(state.status === 'active' || state.status === 'paused') && state.currentQuestion && (
          <div className="space-y-6">
            {/* Header with leave button */}
            <div className="flex items-center justify-between">
              <h1 className="text-xl sm:text-2xl font-display font-bold text-white">
                Live Session
              </h1>
              <button
                onClick={handleLeave}
                className="text-sm text-white/50 hover:text-red-400 font-body transition-colors"
              >
                Leave
              </button>
            </div>

            {/* Battle Scene */}
            <LiveBattleScene
              birdState={state.birdState}
              bossState={state.bossState}
              birdHP={myData?.hp ?? 100}
              bossHP={state.bossHP}
              bossMaxHP={state.bossMaxHP}
            />

            {/* Player Score + Combo */}
            {myData && (
              <div className="flex items-center justify-center gap-4 px-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-white/40 font-body">Score</span>
                  <span className="text-white font-mono font-bold">{myData.score}</span>
                </div>
                {myData.comboCount >= 2 && (
                  <span className="text-xs text-yellow-400 font-bold bg-yellow-400/10 px-2 py-0.5 rounded-full">
                    {myData.comboCount}x combo
                  </span>
                )}
              </div>
            )}

            {/* Timer */}
            <LiveTimer
              remaining={state.timerRemaining}
              total={state.currentQuestion.timeLimit}
              isPaused={state.status === 'paused'}
            />

            {/* Question */}
            <LiveQuestionCard
              index={state.currentQuestion.index}
              totalQuestions={state.currentQuestion.totalQuestions}
              questionText={state.currentQuestion.questionText}
            />

            {/* Answer grid */}
            <LiveAnswerGrid
              options={state.currentQuestion.options}
              onAnswer={actions.submitAnswer}
              disabled={state.hasAnswered || state.status === 'paused'}
              selectedOption={state.selectedOption}
            />

            {/* Status message */}
            {state.hasAnswered && (
              <p className="text-center text-white/40 font-body animate-pulse">
                Answer locked in! Waiting for others...
              </p>
            )}
            {state.status === 'paused' && (
              <p className="text-center text-yellow-400 font-body font-bold">
                Game Paused
              </p>
            )}
          </div>
        )}

        {/* ─── RESULTS PHASE ─── */}
        {state.status === 'results' && state.lastResults && (
          <div className="space-y-6">
            {/* Header with leave button */}
            <div className="flex items-center justify-between">
              <h1 className="text-xl sm:text-2xl font-display font-bold text-white">
                Live Session
              </h1>
              <button
                onClick={handleLeave}
                className="text-sm text-white/50 hover:text-red-400 font-body transition-colors"
              >
                Leave
              </button>
            </div>

            {/* Battle Scene with animations */}
            <LiveBattleScene
              birdState={state.birdState}
              bossState={state.bossState}
              birdHP={myData?.hp ?? 100}
              bossHP={state.bossHP}
              bossMaxHP={state.bossMaxHP}
              bossDamageDealt={state.lastResults.bossDamageDealt}
              correctCount={state.correctCount}
              wrongCount={state.wrongCount}
              collectiveBonus={state.lastResults.collectiveBonus}
              showResults={true}
              flashType={flashType}
            />

            {state.lastResults.bossDefeated && (
              <div className="text-center py-4">
                <p className="text-3xl font-display font-bold text-green-400 animate-pulse">
                  Boss Defeated!
                </p>
              </div>
            )}

            {/* Correct answer reveal */}
            {state.currentQuestion && (
              <LiveAnswerGrid
                options={state.currentQuestion.options}
                onAnswer={() => {}}
                disabled={true}
                selectedOption={state.selectedOption}
                correctOptionIndex={state.lastResults.correctOptionIndex}
              />
            )}

            {/* Your result */}
            {myData && (
              <div className="text-center py-2">
                <p className={`text-lg font-display font-bold ${
                  state.lastResults.scoreboard.find(p => p.userId === user?._id)?.answeredCorrectly
                    ? 'text-green-400' : 'text-red-400'
                }`}>
                  {state.lastResults.scoreboard.find(p => p.userId === user?._id)?.answeredCorrectly
                    ? 'Correct!' : 'Wrong!'}
                </p>
                <p className="text-white/50 text-sm font-body">
                  Score: {myData.score} | HP: {myData.hp}
                </p>
              </div>
            )}

            <LiveScoreboard
              players={state.players}
              currentUserId={user?._id}
            />

            <div className="text-center">
              <p className="text-white/40 font-body animate-pulse">
                Waiting for host to continue...
              </p>
            </div>
          </div>
        )}

        {/* ─── COMPLETED PHASE ─── */}
        {state.status === 'completed' && state.completedData && (
          <div className="space-y-8">
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

            {/* Battle Scene with final state */}
            <LiveBattleScene
              birdState={state.birdState}
              bossState={state.bossState}
              birdHP={myData?.hp ?? 0}
              bossHP={state.bossHP}
              bossMaxHP={state.bossMaxHP}
            />

            {/* Your final rank */}
            {user && (
              <div className="text-center">
                {(() => {
                  const rank = state.players.findIndex(p => p.userId === user._id) + 1;
                  const playerData = state.players.find(p => p.userId === user._id);
                  return rank > 0 ? (
                    <div className="inline-block px-8 py-4 bg-white/5 border border-white/10 rounded-xl">
                      <p className="text-white/50 text-sm font-body mb-1">Your Rank</p>
                      <p className="text-3xl font-display font-bold text-white">#{rank}</p>
                      {playerData && (
                        <p className="text-white/60 text-sm font-body mt-1">
                          Score: {playerData.score} | Accuracy: {(playerData as any).accuracy ?? Math.round((playerData.correctCount / state.questionCount) * 100)}%
                        </p>
                      )}
                    </div>
                  ) : null;
                })()}
              </div>
            )}

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
            <Button onClick={() => { actions.reset(); navigate('/home'); }}>Back to Home</Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveSessionPlay;
