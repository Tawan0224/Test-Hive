// In-memory store for active live session game state.
// MongoDB LiveSession is updated at key checkpoints (create, start, end)
// but the hot game loop (timers, answers, scores) runs from this Map.

const sessions = new Map();

const BASE_BOSS_HP = 100;
const SCALING_PER_PLAYER = 50;
const HP_LOSS_PER_WRONG = 10;

export function createSession({ sessionCode, quiz, hostId, hostSocketId }) {
  const session = {
    sessionCode,
    quizId: quiz._id.toString(),
    hostId: hostId.toString(),
    hostSocketId,
    quiz, // full quiz doc with answers — server only
    status: 'lobby',

    // Boss (recalculated at start based on player count)
    bossMaxHP: BASE_BOSS_HP,
    bossCurrentHP: BASE_BOSS_HP,

    // Players: Map<userId, PlayerState>
    players: new Map(),

    // Question state
    currentQuestionIndex: -1,
    questionStartedAt: null,
    questionTimerRemaining: null,
    timerInterval: null,
    isPaused: false,
  };

  sessions.set(sessionCode, session);
  return session;
}

export function getSession(code) {
  return sessions.get(code);
}

export function removeSession(code) {
  const session = sessions.get(code);
  if (session?.timerInterval) {
    clearInterval(session.timerInterval);
  }
  sessions.delete(code);
}

export function addPlayer(code, user, socketId) {
  const session = sessions.get(code);
  if (!session) return null;

  const userId = user._id.toString();

  // Don't re-add if already in (reconnect case)
  if (session.players.has(userId)) {
    const existing = session.players.get(userId);
    existing.socketId = socketId;
    return existing;
  }

  const player = {
    socketId,
    userId,
    username: user.username,
    displayName: user.displayName || user.username,
    hp: 100,
    score: 0,
    comboCount: 0,
    correctCount: 0,
    currentAnswer: null, // { optionIndex, answeredAt }
  };

  session.players.set(userId, player);
  return player;
}

export function removePlayer(code, userId) {
  const session = sessions.get(code);
  if (!session) return;
  session.players.delete(userId.toString());
}

export function getPlayerList(code) {
  const session = sessions.get(code);
  if (!session) return [];

  return Array.from(session.players.values()).map(p => ({
    userId: p.userId,
    username: p.username,
    displayName: p.displayName,
    hp: p.hp,
    score: p.score,
    comboCount: p.comboCount,
    correctCount: p.correctCount,
  }));
}

export function calculateBossHP(playerCount) {
  return BASE_BOSS_HP + (playerCount * SCALING_PER_PLAYER);
}

export function calculateBossDamage(bossMaxHP, totalQuestions, playerCount) {
  // 70% collective accuracy defeats the boss
  return bossMaxHP / (totalQuestions * playerCount * 0.7);
}

export function calculateScore(question, player, timeRemaining) {
  const timeLimit = question.timeLimit || 30;
  const speedFraction = timeRemaining / timeLimit;
  const basePoints = (question.points || 10) * (0.5 + 0.5 * speedFraction);
  const hpMultiplier = 0.5 + 0.5 * (player.hp / 100);
  const comboBonus = Math.min(player.comboCount - 1, 5) * 2;

  return Math.round(basePoints * hpMultiplier + Math.max(0, comboBonus));
}

export { HP_LOSS_PER_WRONG };
