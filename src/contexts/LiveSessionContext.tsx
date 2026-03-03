import { createContext, useContext, useCallback, useEffect, useReducer, useRef } from 'react';
import { connectSocket, disconnectSocket, getSocket } from '../services/socket';
import type { Socket } from 'socket.io-client';
import type { MascotState } from '../components/battle/battleConfig';

// ── Types ────────────────────────────────────────────

export interface PlayerInfo {
  userId: string;
  username: string;
  displayName: string;
  hp: number;
  score: number;
  comboCount: number;
  correctCount: number;
  answeredCorrectly?: boolean;
}

interface QuestionData {
  index: number;
  questionText: string;
  options: { text: string }[];
  timeLimit: number;
  totalQuestions: number;
  bossHP: number;
  bossMaxHP: number;
}

interface QuestionResults {
  questionIndex: number;
  correctOptionIndex: number;
  scoreboard: PlayerInfo[];
  bossHP: number;
  bossMaxHP: number;
  bossDefeated: boolean;
  bossDamageDealt: number;
  totalQuestions: number;
  isLastQuestion: boolean;
  correctCount: number;
  wrongCount: number;
  collectiveBonus: number;
}

interface CompletedData {
  finalScoreboard: PlayerInfo[];
  bossDefeated: boolean;
  bossHP: number;
  bossMaxHP: number;
  quizTitle: string;
}

export interface LiveSessionState {
  sessionCode: string | null;
  status: 'idle' | 'connecting' | 'lobby' | 'active' | 'paused' | 'results' | 'completed' | 'error';
  isHost: boolean;
  quizTitle: string;
  questionCount: number;
  players: PlayerInfo[];
  currentQuestion: QuestionData | null;
  timerRemaining: number;
  hasAnswered: boolean;
  selectedOption: number | null;
  answerCount: number;
  totalPlayers: number;
  lastResults: QuestionResults | null;
  completedData: CompletedData | null;
  bossHP: number;
  bossMaxHP: number;
  bossState: MascotState;
  birdState: MascotState;
  correctCount: number;
  wrongCount: number;
  error: string | null;
}

type Action =
  | { type: 'SET_HOST'; sessionCode: string; quizTitle: string; questionCount: number }
  | { type: 'SET_CONNECTING' }
  | { type: 'SET_LOBBY'; players: PlayerInfo[]; sessionCode: string; quizTitle: string; questionCount: number }
  | { type: 'PLAYER_JOINED'; players: PlayerInfo[] }
  | { type: 'PLAYER_LEFT'; players: PlayerInfo[] }
  | { type: 'QUESTION'; data: QuestionData }
  | { type: 'TIMER'; remaining: number }
  | { type: 'PAUSED'; remaining: number }
  | { type: 'RESUMED'; remaining: number }
  | { type: 'ANSWERED'; optionIndex: number }
  | { type: 'ANSWER_COUNT'; count: number; total: number }
  | { type: 'QUESTION_RESULTS'; data: QuestionResults }
  | { type: 'COMPLETED'; data: CompletedData }
  | { type: 'SET_BIRD_STATE'; state: MascotState }
  | { type: 'SET_BOSS_STATE'; state: MascotState }
  | { type: 'ERROR'; message: string }
  | { type: 'RESET' };

const initialState: LiveSessionState = {
  sessionCode: null,
  status: 'idle',
  isHost: false,
  quizTitle: '',
  questionCount: 0,
  players: [],
  currentQuestion: null,
  timerRemaining: 0,
  hasAnswered: false,
  selectedOption: null,
  answerCount: 0,
  totalPlayers: 0,
  lastResults: null,
  completedData: null,
  bossHP: 0,
  bossMaxHP: 0,
  bossState: 'idle' as MascotState,
  birdState: 'idle' as MascotState,
  correctCount: 0,
  wrongCount: 0,
  error: null,
};

function reducer(state: LiveSessionState, action: Action): LiveSessionState {
  switch (action.type) {
    case 'SET_HOST':
      return { ...state, isHost: true, sessionCode: action.sessionCode, quizTitle: action.quizTitle, questionCount: action.questionCount, status: 'lobby' };
    case 'SET_CONNECTING':
      return { ...state, status: 'connecting' };
    case 'SET_LOBBY':
      return { ...state, status: 'lobby', players: action.players, sessionCode: action.sessionCode, quizTitle: action.quizTitle, questionCount: action.questionCount, totalPlayers: action.players.length };
    case 'PLAYER_JOINED':
      return { ...state, players: action.players, totalPlayers: action.players.length };
    case 'PLAYER_LEFT':
      return { ...state, players: action.players, totalPlayers: action.players.length };
    case 'QUESTION':
      return { ...state, status: 'active', currentQuestion: action.data, timerRemaining: action.data.timeLimit, hasAnswered: false, selectedOption: null, answerCount: 0, lastResults: null, bossHP: action.data.bossHP, bossMaxHP: action.data.bossMaxHP, bossState: 'idle', birdState: 'idle', correctCount: 0, wrongCount: 0 };
    case 'TIMER':
      return { ...state, timerRemaining: action.remaining };
    case 'PAUSED':
      return { ...state, status: 'paused', timerRemaining: action.remaining };
    case 'RESUMED':
      return { ...state, status: 'active', timerRemaining: action.remaining };
    case 'ANSWERED':
      return { ...state, hasAnswered: true, selectedOption: action.optionIndex };
    case 'ANSWER_COUNT':
      return { ...state, answerCount: action.count, totalPlayers: action.total };
    case 'QUESTION_RESULTS':
      return { ...state, status: 'results', lastResults: action.data, bossHP: action.data.bossHP, bossMaxHP: action.data.bossMaxHP, players: action.data.scoreboard, correctCount: action.data.correctCount, wrongCount: action.data.wrongCount };
    case 'COMPLETED':
      return { ...state, status: 'completed', completedData: action.data, players: action.data.finalScoreboard, bossHP: action.data.bossHP, bossMaxHP: action.data.bossMaxHP, bossState: action.data.bossDefeated ? 'defeat' : 'victory', birdState: action.data.bossDefeated ? 'victory' : 'defeat' };
    case 'SET_BIRD_STATE':
      return { ...state, birdState: action.state };
    case 'SET_BOSS_STATE':
      return { ...state, bossState: action.state };
    case 'ERROR':
      return { ...state, status: 'error', error: action.message };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
}

// ── Context ──────────────────────────────────────────

interface LiveSessionActions {
  initAsHost: (sessionCode: string, quizTitle: string, questionCount: number) => void;
  joinSession: (code: string) => Promise<{ success: boolean; error?: string }>;
  startSession: () => void;
  submitAnswer: (optionIndex: number) => void;
  pauseSession: () => void;
  resumeSession: () => void;
  nextQuestion: () => void;
  leaveSession: () => void;
  reset: () => void;
  setBirdState: (s: MascotState) => void;
  setBossState: (s: MascotState) => void;
}

interface LiveSessionContextValue {
  state: LiveSessionState;
  actions: LiveSessionActions;
}

const LiveSessionContext = createContext<LiveSessionContextValue | null>(null);

export function LiveSessionProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const socketRef = useRef<Socket | null>(null);

  // Connect socket and set up listeners (only once)
  const ensureSocket = useCallback(() => {
    if (socketRef.current) return socketRef.current;

    const socket = connectSocket();
    socketRef.current = socket;

    // ── Listeners ──
    socket.on('session:lobby', ({ players, sessionCode, quizTitle, questionCount }) => {
      dispatch({ type: 'SET_LOBBY', players, sessionCode, quizTitle, questionCount });
    });

    socket.on('session:player-joined', () => {
      // Lobby update comes separately via session:lobby
    });

    socket.on('session:player-left', () => {
      // Lobby update comes separately via session:lobby
    });

    socket.on('session:question', (data: QuestionData) => {
      dispatch({ type: 'QUESTION', data });
    });

    socket.on('session:timer', ({ remaining }) => {
      dispatch({ type: 'TIMER', remaining });
    });

    socket.on('session:paused', ({ remaining }) => {
      dispatch({ type: 'PAUSED', remaining });
    });

    socket.on('session:resumed', ({ remaining }) => {
      dispatch({ type: 'RESUMED', remaining });
    });

    socket.on('session:answer-count', ({ count, total }) => {
      dispatch({ type: 'ANSWER_COUNT', count, total });
    });

    socket.on('session:question-results', (data: QuestionResults) => {
      dispatch({ type: 'QUESTION_RESULTS', data });
    });

    socket.on('session:completed', (data: CompletedData) => {
      dispatch({ type: 'COMPLETED', data });
    });

    socket.on('connect_error', (err) => {
      console.error('[Socket] Connection error:', err.message);
      dispatch({ type: 'ERROR', message: 'Failed to connect to server' });
    });

    return socket;
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnectSocket();
      socketRef.current = null;
    };
  }, []);

  // ── Actions ──

  const initAsHost = useCallback((sessionCode: string, quizTitle: string, questionCount: number) => {
    const socket = ensureSocket();

    // Emit host-join once the socket is connected
    const doHostJoin = () => {
      socket.emit('session:host-join', { sessionCode }, (response: any) => {
        if (response?.error) {
          console.error('[Live] Host join error:', response.error);
          dispatch({ type: 'ERROR', message: response.error });
        }
      });
    };

    if (socket.connected) {
      doHostJoin();
    } else {
      socket.once('connect', doHostJoin);
    }

    dispatch({ type: 'SET_HOST', sessionCode, quizTitle, questionCount });
  }, [ensureSocket]);

  const joinSession = useCallback(async (code: string): Promise<{ success: boolean; error?: string }> => {
    dispatch({ type: 'SET_CONNECTING' });
    const socket = ensureSocket();

    return new Promise((resolve) => {
      socket.emit('session:join', { sessionCode: code }, (response: any) => {
        if (response?.error) {
          dispatch({ type: 'ERROR', message: response.error });
          resolve({ success: false, error: response.error });
        } else {
          resolve({ success: true });
        }
      });
    });
  }, [ensureSocket]);

  const startSession = useCallback(() => {
    const socket = getSocket();
    if (!socket || !state.sessionCode) return;

    socket.emit('session:start', { sessionCode: state.sessionCode }, (response: any) => {
      if (response?.error) {
        dispatch({ type: 'ERROR', message: response.error });
      }
    });
  }, [state.sessionCode]);

  const submitAnswer = useCallback((optionIndex: number) => {
    const socket = getSocket();
    if (!socket || !state.sessionCode || state.hasAnswered) return;

    dispatch({ type: 'ANSWERED', optionIndex });
    socket.emit('session:answer', { sessionCode: state.sessionCode, optionIndex }, (response: any) => {
      if (response?.error) {
        console.error('[Live] Answer error:', response.error);
      }
    });
  }, [state.sessionCode, state.hasAnswered]);

  const pauseSession = useCallback(() => {
    const socket = getSocket();
    if (!socket || !state.sessionCode) return;
    socket.emit('session:pause', { sessionCode: state.sessionCode });
  }, [state.sessionCode]);

  const resumeSession = useCallback(() => {
    const socket = getSocket();
    if (!socket || !state.sessionCode) return;
    socket.emit('session:resume', { sessionCode: state.sessionCode });
  }, [state.sessionCode]);

  const nextQuestion = useCallback(() => {
    const socket = getSocket();
    if (!socket || !state.sessionCode) return;
    socket.emit('session:next', { sessionCode: state.sessionCode });
  }, [state.sessionCode]);

  const leaveSession = useCallback(() => {
    const socket = getSocket();
    if (socket && state.sessionCode) {
      socket.emit('session:leave', { sessionCode: state.sessionCode });
    }
    disconnectSocket();
    socketRef.current = null;
    dispatch({ type: 'RESET' });
  }, [state.sessionCode]);

  const reset = useCallback(() => {
    disconnectSocket();
    socketRef.current = null;
    dispatch({ type: 'RESET' });
  }, []);

  const setBirdState = useCallback((s: MascotState) => {
    dispatch({ type: 'SET_BIRD_STATE', state: s });
  }, []);

  const setBossState = useCallback((s: MascotState) => {
    dispatch({ type: 'SET_BOSS_STATE', state: s });
  }, []);

  const actions: LiveSessionActions = {
    initAsHost,
    joinSession,
    startSession,
    submitAnswer,
    pauseSession,
    resumeSession,
    nextQuestion,
    leaveSession,
    reset,
    setBirdState,
    setBossState,
  };

  return (
    <LiveSessionContext.Provider value={{ state, actions }}>
      {children}
    </LiveSessionContext.Provider>
  );
}

export function useLiveSession() {
  const ctx = useContext(LiveSessionContext);
  if (!ctx) throw new Error('useLiveSession must be used inside LiveSessionProvider');
  return ctx;
}
