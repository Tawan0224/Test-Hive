import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { CheckCircle } from 'lucide-react'

import QuizBirdMascot from '../components/three/QuizBirdMascot'
import QuizOctopusMascot from '../components/three/QuizOctopusMascot'
import { BattleHPBar, BattleEffects, useBattleSystem, BATTLE_CONFIG } from '../components/battle'
import { quizAPI } from '../services/api'

interface MatchingPair {
  id: string
  left: string
  right: string
}

interface MatchingQuizData {
  title: string
  pairs: MatchingPair[]
  timeLimit: number
  points: number
  _id?: string
}

const sampleMatchingData: MatchingQuizData = {
  title: "HTTP Status Codes Matching",
  pairs: [
    { id: '1', left: '200', right: 'OK - Request succeeded' },
    { id: '2', left: '301', right: 'Moved Permanently' },
    { id: '3', left: '404', right: 'Not Found' },
    { id: '4', left: '500', right: 'Internal Server Error' },
    { id: '5', left: '401', right: 'Unauthorized' },
    { id: '6', left: '403', right: 'Forbidden' },
    { id: '7', left: '201', right: 'Created' },
    { id: '8', left: '204', right: 'No Content' },
  ],
  timeLimit: 120,
  points: 10
}

const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

const MatchingQuiz = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const quizData: MatchingQuizData = location.state?.quizData || sampleMatchingData

  const containerRef = useRef<HTMLDivElement>(null)
  const leftItemRefs = useRef<Map<string, HTMLDivElement>>(new Map())
  const rightItemRefs = useRef<Map<string, HTMLDivElement>>(new Map())

  // Shuffled display order (these are the full pair objects, just reordered)
  const [shuffledLeft, setShuffledLeft] = useState<MatchingPair[]>([])
  const [shuffledRight, setShuffledRight] = useState<MatchingPair[]>([])

  // Which item is currently selected (stores the pair.id)
  const [selectedLeftId, setSelectedLeftId] = useState<string | null>(null)
  const [selectedRightId, setSelectedRightId] = useState<string | null>(null)

  // Set of pair IDs that have been correctly matched
  // e.g. if pair {id:'3', left:'404', right:'Not Found'} is matched, '3' is added here
  const [matchedPairIds, setMatchedPairIds] = useState<Set<string>>(new Set())

  // For SVG lines: leftId -> rightId (always same since correct match means same id)
  const [connectionLines, setConnectionLines] = useState<Array<{
    startX: number; startY: number; endX: number; endY: number; id: string
  }>>([])

  // Brief flash state for wrong attempts
  const [wrongFlashLeftId, setWrongFlashLeftId] = useState<string | null>(null)
  const [wrongFlashRightId, setWrongFlashRightId] = useState<string | null>(null)

  const [timeRemaining, setTimeRemaining] = useState(quizData.timeLimit)
  const [isComplete, setIsComplete] = useState(false)
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false)

  const [battle, battleActions] = useBattleSystem(quizData.pairs.length)

  useEffect(() => {
    setShuffledLeft(shuffleArray([...quizData.pairs]))
    setShuffledRight(shuffleArray([...quizData.pairs]))
  }, [quizData.pairs])

  // Auto-end when bird HP reaches 0
  useEffect(() => {
    if (battle.birdDefeated && !isComplete) {
      const timeout = setTimeout(() => {
        setIsComplete(true)
        handleComplete()
      }, BATTLE_CONFIG.NEXT_QUESTION_DELAY)
      return () => clearTimeout(timeout)
    }
  }, [battle.birdDefeated, isComplete])

  // Timer
  useEffect(() => {
    if (isComplete || timeRemaining <= 0) return
    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) { setIsComplete(true); return 0 }
        return prev - 1
      })
    }, 1000)
      return () => clearInterval(timer)
    }, [isComplete, timeRemaining])
  // When timer hits 0, trigger results (only if not already ended by bird defeat or manual submit)
  useEffect(() => {
    if (timeRemaining === 0 && isComplete && !battle.birdDefeated) {
      handleComplete()
    }
  }, [timeRemaining, isComplete])

  // Auto-complete when all pairs matched
  useEffect(() => {
    if (quizData.pairs.length > 0 && matchedPairIds.size === quizData.pairs.length) {
      setIsComplete(true)
    }
  }, [matchedPairIds.size, quizData.pairs.length])

  // Draw SVG connection lines for matched pairs
  const updateConnectionLines = useCallback(() => {
    if (!containerRef.current) return
    const containerRect = containerRef.current.getBoundingClientRect()
    const lines: typeof connectionLines = []

    matchedPairIds.forEach((pairId) => {
      // Left item ref key = pairId, right item ref key = pairId (same pair)
      const leftEl = leftItemRefs.current.get(pairId)
      const rightEl = rightItemRefs.current.get(pairId)
      if (leftEl && rightEl) {
        const leftRect = leftEl.getBoundingClientRect()
        const rightRect = rightEl.getBoundingClientRect()
        lines.push({
          startX: leftRect.right - containerRect.left,
          startY: leftRect.top + leftRect.height / 2 - containerRect.top,
          endX: rightRect.left - containerRect.left,
          endY: rightRect.top + rightRect.height / 2 - containerRect.top,
          id: pairId
        })
      }
    })
    setConnectionLines(lines)
  }, [matchedPairIds])

  useEffect(() => {
    updateConnectionLines()
    window.addEventListener('resize', updateConnectionLines)
    return () => window.removeEventListener('resize', updateConnectionLines)
  }, [updateConnectionLines])

  // ─── MATCH ATTEMPT ────────────────────────────────────────────
  // Called when both a left and right item are selected.
  // leftId = the pair.id of the selected LEFT item
  // rightId = the pair.id of the selected RIGHT item
  // A correct match means leftId === rightId (same pair)
  const attemptMatch = useCallback((leftId: string, rightId: string) => {
    // Clear selections immediately
    setSelectedLeftId(null)
    setSelectedRightId(null)

    if (leftId === rightId) {
      // ✅ CORRECT — same pair id means left term matches right definition
      setMatchedPairIds(prev => new Set([...prev, leftId]))
      battleActions.triggerCorrectAnswer()
    } else {
      // ❌ WRONG — flash both items red briefly
      setWrongFlashLeftId(leftId)
      setWrongFlashRightId(rightId)
      setTimeout(() => {
        setWrongFlashLeftId(null)
        setWrongFlashRightId(null)
      }, 700)
      battleActions.triggerWrongAnswer()
    }
  }, [battleActions])

  // ─── LEFT CLICK ───────────────────────────────────────────────
  const handleLeftClick = (pair: MatchingPair) => {
    // Ignore if already correctly matched or game over
    if (isComplete || matchedPairIds.has(pair.id) || battle.birdDefeated) return

    // Clicking same selected item = deselect
    if (selectedLeftId === pair.id) {
      setSelectedLeftId(null)
      return
    }

    // If a right item is already selected, attempt the match now
    if (selectedRightId !== null) {
      attemptMatch(pair.id, selectedRightId)
      return
    }

    // Otherwise just select this left item
    setSelectedLeftId(pair.id)
  }

  // ─── RIGHT CLICK ──────────────────────────────────────────────
  const handleRightClick = (pair: MatchingPair) => {
    // Ignore if already correctly matched or game over
    if (isComplete || matchedPairIds.has(pair.id) || battle.birdDefeated) return

    // Clicking same selected item = deselect
    if (selectedRightId === pair.id) {
      setSelectedRightId(null)
      return
    }

    // If a left item is already selected, attempt the match now
    if (selectedLeftId !== null) {
      attemptMatch(selectedLeftId, pair.id)
      return
    }

    // Otherwise just select this right item
    setSelectedRightId(pair.id)
  }

  const handleComplete = useCallback(async () => {
    const accuracy = Math.round((matchedPairIds.size / quizData.pairs.length) * 100)

    if (quizData._id) {
      try {
        await quizAPI.submitAttempt(quizData._id, {
          score: accuracy,
          totalQuestions: quizData.pairs.length,
          correctAnswers: matchedPairIds.size,
          accuracy,
          timeSpentSeconds: quizData.timeLimit - timeRemaining,
        })
      } catch (err) {
        console.error('Failed to save attempt:', err)
      }
    }

    navigate('/quiz-results', {
      state: {
        results: {
          totalQuestions: quizData.pairs.length,
          correctAnswers: matchedPairIds.size,
          score: accuracy,
          answers: quizData.pairs.map((_, i) => matchedPairIds.has(String(i + 1)) ? 0 : null),
          quizData: {
            title: quizData.title,
            questions: quizData.pairs.map(p => ({
              questionText: `Match: ${p.left}`,
              options: [{ text: p.right, isCorrect: true }]
            }))
          }
        }
      }
    })
  }, [matchedPairIds.size, navigate, quizData, timeRemaining])

  const handleSubmit = () => { setIsComplete(true); handleComplete() }
  const handleLeaveQuiz = () => setShowLeaveConfirm(true)
  const confirmLeaveQuiz = () => navigate('/home')

  const timerPercentage = (timeRemaining / quizData.timeLimit) * 100
  const progressPercentage = (matchedPairIds.size / quizData.pairs.length) * 100
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className={`h-screen w-screen relative overflow-hidden ${battle.screenShake ? 'animate-battle-screen-shake' : ''}`}>
      {/* Ambient background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-hive-purple/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-hive-blue/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-hive-pink/5 rounded-full blur-3xl" />
      </div>

      {/* ─── LEFT HP BAR ─── */}
      <div className="absolute top-[280px] left-20 z-30 pointer-events-none">
        <BattleHPBar current={battle.birdHP} max={BATTLE_CONFIG.BIRD_MAX_HP}
          name="Bird" side="left" isHit={battle.isBirdHit} />
      </div>
      {/* ─── BIRD MASCOT ─── */}
      <div className="absolute -left-32 bottom-2 w-[860px] h-[920px] z-10 pointer-events-none overflow-visible">
        <QuizBirdMascot battleState={battle.birdState} />
      </div>

      {/* ─── RIGHT HP BAR ─── */}
      <div className="absolute top-[280px] right-20 z-30 pointer-events-none">
        <BattleHPBar current={battle.octopusHP} max={BATTLE_CONFIG.OCTOPUS_MAX_HP}
          name="Octopus" side="right" isHit={battle.isOctopusHit} />
      </div>
      {/* ─── OCTOPUS MASCOT ─── */}
      <div className="absolute -right-36 -bottom-20 w-[780px] h-[880px] z-10 pointer-events-none overflow-visible">
        <QuizOctopusMascot battleState={battle.octopusState} />
      </div>

      {/* ─── BATTLE EFFECTS ─── */}
      <div className="absolute inset-0 z-25 pointer-events-none">
        <BattleEffects lastAction={battle.lastAction} comboCount={battle.comboCount} />
      </div>

      {/* Main Content */}
      <div className="relative z-20 h-full flex flex-col">
        {/* Header */}
        <nav className="flex-shrink-0 px-8 py-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <a href="/home" className="text-2xl font-display font-bold tracking-wider text-white hover:text-hive-purple-light transition-colors duration-300 italic">
              TestHive
            </a>
            <h2 className="text-xl font-display font-medium text-white tracking-wide">Matching Quiz</h2>
            <button onClick={handleLeaveQuiz}
              className="px-6 py-2.5 border border-hive-purple/40 text-white/90 rounded-lg hover:bg-hive-purple/10 hover:border-hive-purple transition-all duration-300 text-sm font-medium font-body">
              Leave Quiz
            </button>
          </div>
        </nav>

        {/* Timer & Progress */}
        <div className="flex-shrink-0 px-8 py-4">
          <div className="max-w-4xl mx-auto flex items-center justify-between gap-8">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white/60 text-sm font-body">Time Remaining</span>
                <span className={`text-lg font-bold font-display ${timerPercentage <= 25 ? 'text-red-400' : timerPercentage <= 50 ? 'text-yellow-400' : 'text-hive-blue'}`}>
                  {formatTime(timeRemaining)}
                </span>
              </div>
              <div className="h-3 bg-dark-600/50 rounded-full overflow-hidden border border-white/5">
                <div className="h-full rounded-full transition-all duration-1000 ease-linear relative"
                  style={{
                    width: `${timerPercentage}%`,
                    background: timerPercentage > 50
                      ? 'linear-gradient(90deg, #3B82F6, #60a5fa)'
                      : timerPercentage > 25
                        ? 'linear-gradient(90deg, #d97706, #fbbf24)'
                        : 'linear-gradient(90deg, #dc2626, #f87171)'
                  }}>
                  <div className="absolute inset-0 bg-gradient-to-t from-transparent to-white/20" />
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-white/80 text-sm font-medium tracking-wide font-body">Pairs Matched</p>
              <p className="text-white text-3xl font-bold mt-1 font-display">
                <span className="text-hive-purple-light">{matchedPairIds.size}</span>
                <span className="text-white/40">/</span>
                <span>{quizData.pairs.length}</span>
              </p>
            </div>
          </div>
          <div className="max-w-4xl mx-auto mt-4">
            <div className="h-2 bg-dark-600/50 rounded-full overflow-hidden border border-white/5">
              <div className="h-full rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progressPercentage}%`, background: 'linear-gradient(90deg, #9333EA, #EC4899)' }} />
            </div>
          </div>
        </div>

        {/* Bird Defeated Overlay */}
        {battle.birdDefeated && (
          <div className="flex-shrink-0 flex justify-center px-8 py-2">
            <div className="bg-red-500/20 border border-red-500/40 rounded-xl px-6 py-3 backdrop-blur-sm">
              <p className="text-red-400 font-display font-bold text-center">
                Bird has been defeated! Submitting results...
              </p>
            </div>
          </div>
        )}

        {/* Matching Area */}
        <div className="flex-1 px-8 py-4 overflow-y-auto">
          <div ref={containerRef} className="max-w-4xl mx-auto relative min-h-full">

            {/* SVG Lines — only for correct matches */}
            <svg className="absolute top-0 left-0 w-full pointer-events-none z-10"
              style={{ height: '100%', minHeight: '100%' }}>
              <defs>
                <linearGradient id="correctGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#22c55e" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#4ade80" stopOpacity="0.8" />
                </linearGradient>
              </defs>
              {connectionLines.map(line => (
                <g key={line.id}>
                  <path
                    d={`M ${line.startX} ${line.startY} C ${line.startX + 50} ${line.startY}, ${line.endX - 50} ${line.endY}, ${line.endX} ${line.endY}`}
                    fill="none" stroke="#22c55e" strokeWidth="8" strokeOpacity="0.15" />
                  <path
                    d={`M ${line.startX} ${line.startY} C ${line.startX + 50} ${line.startY}, ${line.endX - 50} ${line.endY}, ${line.endX} ${line.endY}`}
                    fill="none" stroke="url(#correctGradient)" strokeWidth="3" strokeLinecap="round" />
                  <circle cx={line.startX} cy={line.startY} r="6" fill="#22c55e" />
                  <circle cx={line.endX} cy={line.endY} r="6" fill="#22c55e" />
                </g>
              ))}
            </svg>

            {/* Two Columns */}
            <div className="flex gap-16 justify-center pb-8">

              {/* Left Column — Terms */}
              <div className="flex flex-col gap-3 w-64">
                <h3 className="text-white/60 text-sm font-medium mb-2 text-center font-body uppercase tracking-wider">Terms</h3>
                {shuffledLeft.map((pair) => {
                  const isMatched = matchedPairIds.has(pair.id)
                  const isSelected = selectedLeftId === pair.id
                  const isWrongFlash = wrongFlashLeftId === pair.id

                  return (
                    <div
                      key={`left-${pair.id}`}
                      ref={(el) => { if (el) leftItemRefs.current.set(pair.id, el) }}
                      onClick={() => handleLeftClick(pair)}
                      className={`relative p-4 rounded-xl transition-all duration-200 border-2 font-body text-center select-none
                        ${isMatched
                          ? 'bg-green-500/20 border-green-500/50 text-green-300 cursor-default'
                          : isSelected
                            ? 'bg-hive-purple/30 border-hive-purple text-white scale-105 shadow-lg shadow-hive-purple/30 cursor-pointer'
                            : isWrongFlash
                              ? 'bg-red-500/20 border-red-500/60 text-red-300 cursor-pointer'
                              : 'bg-dark-600/50 border-white/10 text-white/90 hover:bg-dark-500/50 hover:border-hive-purple/50 cursor-pointer'
                        }`}
                    >
                      {isMatched && (
                        <div className="absolute -top-2 -right-2 bg-green-500 rounded-full p-1">
                          <CheckCircle size={14} className="text-white" />
                        </div>
                      )}
                      <span className="font-semibold text-base">{pair.left}</span>
                    </div>
                  )
                })}
              </div>

              {/* Right Column — Definitions */}
              <div className="flex flex-col gap-3 w-72">
                <h3 className="text-white/60 text-sm font-medium mb-2 text-center font-body uppercase tracking-wider">Definitions</h3>
                {shuffledRight.map((pair) => {
                  const isMatched = matchedPairIds.has(pair.id)
                  const isSelected = selectedRightId === pair.id
                  const isWrongFlash = wrongFlashRightId === pair.id

                  return (
                    <div
                      key={`right-${pair.id}`}
                      ref={(el) => { if (el) rightItemRefs.current.set(pair.id, el) }}
                      onClick={() => handleRightClick(pair)}
                      className={`relative p-4 rounded-xl transition-all duration-200 border-2 font-body text-center text-sm select-none
                        ${isMatched
                          ? 'bg-green-500/20 border-green-500/50 text-green-300 cursor-default opacity-70'
                          : isSelected
                            ? 'bg-hive-purple/30 border-hive-purple text-white scale-105 shadow-lg shadow-hive-purple/30 cursor-pointer'
                            : isWrongFlash
                              ? 'bg-red-500/20 border-red-500/60 text-red-300 cursor-pointer'
                              : 'bg-dark-600/50 border-white/10 text-white/90 hover:bg-dark-500/50 hover:border-hive-purple/50 cursor-pointer'
                        }`}
                    >
                      {isMatched && (
                        <div className="absolute -top-2 -left-2 bg-green-500 rounded-full p-1">
                          <CheckCircle size={14} className="text-white" />
                        </div>
                      )}
                      <span>{pair.right}</span>
                    </div>
                  )
                })}
              </div>

            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex-shrink-0 px-8 py-4 border-t border-white/5 bg-dark-900/50 backdrop-blur-sm">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <p className="text-white/40 text-sm font-body">
              {isComplete
                ? `Completed! ${matchedPairIds.size}/${quizData.pairs.length} pairs matched correctly`
                : battle.birdDefeated
                  ? 'Bird defeated! Submitting results...'
                  : selectedLeftId
                    ? '✓ Term selected — now click a definition on the right'
                    : selectedRightId
                      ? '✓ Definition selected — now click a term on the left'
                      : 'Select a term, then select its matching definition'
              }
            </p>
            <button
              onClick={handleSubmit}
              disabled={battle.birdDefeated}
              className="px-8 py-3 bg-gradient-to-r from-hive-purple to-hive-pink text-white rounded-xl 
                         font-semibold hover:shadow-lg hover:shadow-hive-purple/30 transition-all duration-300
                         disabled:opacity-50 disabled:cursor-not-allowed font-body">
              Submit
            </button>
          </div>
        </div>
      </div>

      {/* Leave Quiz Modal */}
      {showLeaveConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="relative bg-gradient-to-br from-dark-600 to-dark-800 border border-hive-purple/30 
                          rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl shadow-hive-purple/20">
            <div className="absolute inset-0 bg-hive-purple/5 rounded-2xl blur-xl" />
            <div className="relative">
              <h3 className="text-2xl font-bold text-white mb-4 font-display">Leave Quiz?</h3>
              <p className="text-white/70 mb-8 leading-relaxed font-body">
                Are you sure you want to leave? Your progress will not be saved.
              </p>
              <div className="flex gap-4 justify-end">
                <button onClick={() => setShowLeaveConfirm(false)}
                  className="px-6 py-2.5 bg-dark-500 text-white/80 rounded-lg hover:bg-dark-500/80 transition-all duration-300 font-body">
                  Cancel
                </button>
                <button onClick={confirmLeaveQuiz}
                  className="px-6 py-2.5 bg-red-500/80 text-white rounded-lg hover:bg-red-500 transition-all duration-300 font-body">
                  Leave
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default MatchingQuiz