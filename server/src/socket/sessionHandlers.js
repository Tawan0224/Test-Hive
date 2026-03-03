import Quiz from '../models/Quiz.js';
import LiveSession from '../models/LiveSession.js';
import {
  createSession,
  getSession,
  removeSession,
  addPlayer,
  removePlayer,
  getPlayerList,
  calculateBossHP,
  calculateBossDamage,
  calculateScore,
  HP_LOSS_PER_WRONG,
} from './sessionStore.js';

const ROOM_PREFIX = 'live:';

function roomName(code) {
  return `${ROOM_PREFIX}${code}`;
}

export function registerSessionHandlers(io, socket) {
  // ──────────────────────────────────────────
  // session:host-join  —  Host joins socket room after REST creation
  // ──────────────────────────────────────────
  socket.on('session:host-join', ({ sessionCode }, callback) => {
    const session = getSession(sessionCode);
    if (!session) return callback?.({ error: 'Session not found' });
    if (session.hostId !== socket.user._id.toString()) {
      return callback?.({ error: 'You are not the host' });
    }

    // Update the host's socket ID (was null from REST creation)
    session.hostSocketId = socket.id;
    socket.join(roomName(sessionCode));

    // Send current lobby state back
    const players = getPlayerList(sessionCode);
    callback?.({ success: true });

    io.to(roomName(sessionCode)).emit('session:lobby', {
      players,
      sessionCode,
      quizTitle: session.quiz.title,
      questionCount: session.quiz.questions.length,
    });

    console.log(`[Live] Host ${socket.user.username} joined room for session ${sessionCode}`);
  });

  // ──────────────────────────────────────────
  // session:create  —  Lecturer creates a session
  // ──────────────────────────────────────────
  socket.on('session:create', async ({ quizId }, callback) => {
    try {
      const quiz = await Quiz.findById(quizId);
      if (!quiz) return callback?.({ error: 'Quiz not found' });
      if (quiz.type !== 'multiple-choice') {
        return callback?.({ error: 'Only multiple-choice quizzes are supported for live sessions' });
      }
      if (quiz.creatorId.toString() !== socket.user._id.toString()) {
        return callback?.({ error: 'Only the quiz creator can host a live session' });
      }

      // Generate unique code
      let sessionCode;
      let attempts = 0;
      do {
        sessionCode = LiveSession.generateCode();
        attempts++;
      } while (getSession(sessionCode) && attempts < 10);

      const bossHP = calculateBossHP(1); // recalculated at start

      // Persist to MongoDB
      const liveSession = await LiveSession.create({
        quizId: quiz._id,
        hostId: socket.user._id,
        sessionCode,
        bossMaxHP: bossHP,
        bossCurrentHP: bossHP,
      });

      // Create in-memory session
      createSession({
        sessionCode,
        quiz: quiz.toObject(),
        hostId: socket.user._id,
        hostSocketId: socket.id,
      });

      // Host joins the socket room
      socket.join(roomName(sessionCode));

      callback?.({
        sessionCode,
        quizTitle: quiz.title,
        questionCount: quiz.questions.length,
        sessionId: liveSession._id.toString(),
      });

      console.log(`[Live] Session ${sessionCode} created by ${socket.user.username} for quiz "${quiz.title}"`);
    } catch (err) {
      console.error('[Live] session:create error:', err);
      callback?.({ error: 'Failed to create session' });
    }
  });

  // ──────────────────────────────────────────
  // session:join  —  Student joins the lobby
  // ──────────────────────────────────────────
  socket.on('session:join', async ({ sessionCode }, callback) => {
    try {
      const session = getSession(sessionCode);
      if (!session) return callback?.({ error: 'Session not found' });
      if (session.status !== 'lobby') return callback?.({ error: 'Session already in progress' });

      // Don't let the host join as a player
      if (session.hostId === socket.user._id.toString()) {
        return callback?.({ error: 'You are the host of this session' });
      }

      const player = addPlayer(sessionCode, socket.user, socket.id);
      socket.join(roomName(sessionCode));

      // Update MongoDB participant list
      await LiveSession.findOneAndUpdate(
        { sessionCode },
        { $addToSet: { participants: { userId: socket.user._id, username: socket.user.username, displayName: socket.user.displayName || socket.user.username } } }
      );

      const players = getPlayerList(sessionCode);

      // Notify the whole room
      io.to(roomName(sessionCode)).emit('session:lobby', {
        players,
        sessionCode,
        quizTitle: session.quiz.title,
        questionCount: session.quiz.questions.length,
      });

      io.to(roomName(sessionCode)).emit('session:player-joined', {
        username: player.username,
        displayName: player.displayName,
        playerCount: players.length,
      });

      callback?.({ success: true, quizTitle: session.quiz.title });

      console.log(`[Live] ${socket.user.username} joined session ${sessionCode} (${players.length} players)`);
    } catch (err) {
      console.error('[Live] session:join error:', err);
      callback?.({ error: 'Failed to join session' });
    }
  });

  // ──────────────────────────────────────────
  // session:start  —  Lecturer starts the quiz
  // ──────────────────────────────────────────
  socket.on('session:start', async ({ sessionCode }, callback) => {
    try {
      const session = getSession(sessionCode);
      if (!session) return callback?.({ error: 'Session not found' });
      if (session.hostId !== socket.user._id.toString()) {
        return callback?.({ error: 'Only the host can start' });
      }
      if (session.status !== 'lobby') return callback?.({ error: 'Session already started' });
      if (session.players.size === 0) return callback?.({ error: 'Need at least 1 player to start' });

      // Recalculate boss HP based on actual player count
      const playerCount = session.players.size;
      session.bossMaxHP = calculateBossHP(playerCount);
      session.bossCurrentHP = session.bossMaxHP;
      session.status = 'active';
      session.currentQuestionIndex = 0;

      // Update MongoDB
      await LiveSession.findOneAndUpdate(
        { sessionCode },
        { status: 'active', bossMaxHP: session.bossMaxHP, bossCurrentHP: session.bossCurrentHP, startedAt: new Date() }
      );

      // Send first question
      sendQuestion(io, session);

      callback?.({ success: true });
      console.log(`[Live] Session ${sessionCode} started with ${playerCount} players, boss HP: ${session.bossMaxHP}`);
    } catch (err) {
      console.error('[Live] session:start error:', err);
      callback?.({ error: 'Failed to start session' });
    }
  });

  // ──────────────────────────────────────────
  // session:answer  —  Student submits an answer
  // ──────────────────────────────────────────
  socket.on('session:answer', ({ sessionCode, optionIndex }, callback) => {
    const session = getSession(sessionCode);
    if (!session) return callback?.({ error: 'Session not found' });
    if (session.status !== 'active') return callback?.({ error: 'Session not active' });

    const userId = socket.user._id.toString();
    const player = session.players.get(userId);
    if (!player) return callback?.({ error: 'You are not in this session' });
    if (player.currentAnswer !== null) return callback?.({ error: 'Already answered' });

    // Record the answer with timestamp
    player.currentAnswer = {
      optionIndex,
      answeredAt: Date.now(),
    };

    callback?.({ received: true });

    // Notify host of answer count
    const answeredCount = Array.from(session.players.values()).filter(p => p.currentAnswer !== null).length;
    const totalPlayers = session.players.size;

    io.to(session.hostSocketId).emit('session:answer-count', {
      count: answeredCount,
      total: totalPlayers,
    });

    // If all players have answered, close the question immediately
    if (answeredCount >= totalPlayers) {
      closeQuestion(io, session);
    }
  });

  // ──────────────────────────────────────────
  // session:pause / session:resume
  // ──────────────────────────────────────────
  socket.on('session:pause', ({ sessionCode }, callback) => {
    const session = getSession(sessionCode);
    if (!session) return callback?.({ error: 'Session not found' });
    if (session.hostId !== socket.user._id.toString()) return callback?.({ error: 'Only host can pause' });
    if (session.status !== 'active' || session.isPaused) return callback?.({ error: 'Cannot pause' });

    // Stop the timer and save remaining time
    if (session.timerInterval) {
      clearInterval(session.timerInterval);
      session.timerInterval = null;
    }
    session.isPaused = true;

    io.to(roomName(sessionCode)).emit('session:paused', {
      remaining: session.questionTimerRemaining,
    });

    callback?.({ success: true });
  });

  socket.on('session:resume', ({ sessionCode }, callback) => {
    const session = getSession(sessionCode);
    if (!session) return callback?.({ error: 'Session not found' });
    if (session.hostId !== socket.user._id.toString()) return callback?.({ error: 'Only host can resume' });
    if (!session.isPaused) return callback?.({ error: 'Not paused' });

    session.isPaused = false;
    session.questionStartedAt = Date.now();

    // Restart timer from remaining time
    startTimer(io, session, session.questionTimerRemaining);

    io.to(roomName(sessionCode)).emit('session:resumed', {
      remaining: session.questionTimerRemaining,
    });

    callback?.({ success: true });
  });

  // ──────────────────────────────────────────
  // session:next  —  Lecturer advances to next question
  // ──────────────────────────────────────────
  socket.on('session:next', ({ sessionCode }, callback) => {
    const session = getSession(sessionCode);
    if (!session) return callback?.({ error: 'Session not found' });
    if (session.hostId !== socket.user._id.toString()) return callback?.({ error: 'Only host can advance' });

    session.currentQuestionIndex++;

    if (session.currentQuestionIndex >= session.quiz.questions.length || session.bossCurrentHP <= 0) {
      finalizeSession(io, session);
    } else {
      sendQuestion(io, session);
    }

    callback?.({ success: true });
  });

  // ──────────────────────────────────────────
  // session:leave  —  Player leaves
  // ──────────────────────────────────────────
  socket.on('session:leave', ({ sessionCode }) => {
    handlePlayerLeave(io, socket, sessionCode);
  });

  // ──────────────────────────────────────────
  // disconnect  —  Handle disconnects
  // ──────────────────────────────────────────
  socket.on('disconnect', () => {
    // Find which session this socket was in and handle the leave
    // We iterate sessions — acceptable since session count is small
    // For a production app you'd maintain a socket->session mapping
  });
}

// ─── HELPER FUNCTIONS ────────────────────────────────────────

function sendQuestion(io, session) {
  const question = session.quiz.questions[session.currentQuestionIndex];
  if (!question) return;

  // Reset all player answers for the new question
  for (const player of session.players.values()) {
    player.currentAnswer = null;
  }

  session.questionStartedAt = Date.now();
  session.isPaused = false;

  const timeLimit = question.timeLimit || 30;
  session.questionTimerRemaining = timeLimit;

  // Send question to everyone (without isCorrect!)
  io.to(roomName(session.sessionCode)).emit('session:question', {
    index: session.currentQuestionIndex,
    questionText: question.questionText,
    options: question.options.map(o => ({ text: o.text })), // strip isCorrect
    timeLimit,
    totalQuestions: session.quiz.questions.length,
    bossHP: session.bossCurrentHP,
    bossMaxHP: session.bossMaxHP,
  });

  // Start the countdown timer
  startTimer(io, session, timeLimit);
}

function startTimer(io, session, duration) {
  // Clear any existing timer
  if (session.timerInterval) {
    clearInterval(session.timerInterval);
  }

  session.questionTimerRemaining = duration;

  session.timerInterval = setInterval(() => {
    session.questionTimerRemaining--;

    io.to(roomName(session.sessionCode)).emit('session:timer', {
      remaining: session.questionTimerRemaining,
    });

    if (session.questionTimerRemaining <= 0) {
      clearInterval(session.timerInterval);
      session.timerInterval = null;
      closeQuestion(io, session);
    }
  }, 1000);
}

function closeQuestion(io, session) {
  // Prevent double-close
  if (session.timerInterval) {
    clearInterval(session.timerInterval);
    session.timerInterval = null;
  }

  const question = session.quiz.questions[session.currentQuestionIndex];
  const correctIndex = question.options.findIndex(o => o.isCorrect);
  const playerCount = session.players.size;
  const totalQuestions = session.quiz.questions.length;
  const bossDamagePerCorrect = calculateBossDamage(session.bossMaxHP, totalQuestions, playerCount);

  let totalBossDamage = 0;

  // Evaluate each player's answer
  for (const player of session.players.values()) {
    if (player.currentAnswer && player.currentAnswer.optionIndex === correctIndex) {
      // CORRECT
      player.comboCount++;
      player.correctCount++;

      // Calculate time remaining when this player answered (not when question closed)
      const elapsedSeconds = (player.currentAnswer.answeredAt - session.questionStartedAt) / 1000;
      const timeRemaining = Math.max(0, (question.timeLimit || 30) - elapsedSeconds);

      const points = calculateScore(question, player, timeRemaining);
      player.score += points;

      totalBossDamage += bossDamagePerCorrect;
    } else {
      // WRONG or no answer
      player.hp = Math.max(0, player.hp - HP_LOSS_PER_WRONG);
      player.comboCount = 0;
    }
  }

  // Collective bonus: 25% extra damage if ALL players answered correctly
  const allCorrect = Array.from(session.players.values()).every(
    p => p.currentAnswer && p.currentAnswer.optionIndex === correctIndex
  );
  let collectiveBonus = 0;
  if (allCorrect && playerCount >= 2) {
    collectiveBonus = Math.round(totalBossDamage * 0.25);
    totalBossDamage += collectiveBonus;
  }

  // Apply boss damage
  session.bossCurrentHP = Math.max(0, session.bossCurrentHP - totalBossDamage);

  const bossDefeated = session.bossCurrentHP <= 0;

  // Build scoreboard
  const scoreboard = Array.from(session.players.values())
    .map(p => ({
      userId: p.userId,
      username: p.username,
      displayName: p.displayName,
      score: p.score,
      hp: p.hp,
      comboCount: p.comboCount,
      correctCount: p.correctCount,
      answeredCorrectly: p.currentAnswer?.optionIndex === correctIndex,
    }))
    .sort((a, b) => b.score - a.score);

  // Count correct / wrong for battle animations
  const correctCount = scoreboard.filter(p => p.answeredCorrectly).length;
  const wrongCount = scoreboard.filter(p => !p.answeredCorrectly).length;

  // Emit results to everyone
  io.to(roomName(session.sessionCode)).emit('session:question-results', {
    questionIndex: session.currentQuestionIndex,
    correctOptionIndex: correctIndex,
    scoreboard,
    bossHP: Math.round(session.bossCurrentHP),
    bossMaxHP: session.bossMaxHP,
    bossDefeated,
    bossDamageDealt: Math.round(totalBossDamage),
    totalQuestions,
    isLastQuestion: session.currentQuestionIndex >= totalQuestions - 1,
    correctCount,
    wrongCount,
    collectiveBonus,
  });

  // If boss defeated, auto-finalize
  if (bossDefeated) {
    setTimeout(() => finalizeSession(io, session), 100);
  }
}

async function finalizeSession(io, session) {
  if (session.status === 'completed') return; // prevent double finalize

  session.status = 'completed';

  if (session.timerInterval) {
    clearInterval(session.timerInterval);
    session.timerInterval = null;
  }

  const finalScoreboard = Array.from(session.players.values())
    .map(p => ({
      userId: p.userId,
      username: p.username,
      displayName: p.displayName,
      score: p.score,
      hp: p.hp,
      correctCount: p.correctCount,
      totalQuestions: session.quiz.questions.length,
      accuracy: Math.round((p.correctCount / session.quiz.questions.length) * 100),
    }))
    .sort((a, b) => b.score - a.score);

  // Update MongoDB
  try {
    await LiveSession.findOneAndUpdate(
      { sessionCode: session.sessionCode },
      {
        status: 'completed',
        bossCurrentHP: Math.round(session.bossCurrentHP),
        completedAt: new Date(),
        currentQuestionIndex: session.currentQuestionIndex,
        participants: finalScoreboard.map(p => ({
          userId: p.userId,
          username: p.username,
          displayName: p.displayName,
          finalScore: p.score,
          finalHP: p.hp,
          correctCount: p.correctCount,
        })),
      }
    );
  } catch (err) {
    console.error('[Live] Failed to save session results:', err);
  }

  io.to(roomName(session.sessionCode)).emit('session:completed', {
    finalScoreboard,
    bossDefeated: session.bossCurrentHP <= 0,
    bossHP: Math.round(session.bossCurrentHP),
    bossMaxHP: session.bossMaxHP,
    quizTitle: session.quiz.title,
  });

  console.log(`[Live] Session ${session.sessionCode} completed. Boss ${session.bossCurrentHP <= 0 ? 'DEFEATED' : 'SURVIVED'}`);

  // Clean up in-memory store after a delay (allow clients to view results)
  setTimeout(() => removeSession(session.sessionCode), 5 * 60 * 1000);
}

function handlePlayerLeave(io, socket, sessionCode) {
  const session = getSession(sessionCode);
  if (!session) return;

  const userId = socket.user._id.toString();
  socket.leave(roomName(sessionCode));

  // Don't remove player data if session is active (preserve scores)
  if (session.status === 'lobby') {
    removePlayer(sessionCode, userId);
  }

  const players = getPlayerList(sessionCode);
  io.to(roomName(sessionCode)).emit('session:player-left', {
    username: socket.user.username,
    playerCount: players.length,
  });

  io.to(roomName(sessionCode)).emit('session:lobby', {
    players,
    sessionCode,
    quizTitle: session.quiz.title,
    questionCount: session.quiz.questions.length,
  });
}
