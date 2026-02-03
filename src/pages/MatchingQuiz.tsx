import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { CheckCircle, XCircle } from 'lucide-react'

// Import 3D Mascot Components - Reusing from Multiple Choice Quiz
import QuizBirdMascot from '../components/three/QuizBirdMascot'
import QuizOctopusMascot from '../components/three/QuizOctopusMascot'

// Types
interface MatchingPair {
  id: string
  left: string  // Term
  right: string // Definition
}

interface MatchingQuizData {
  title: string
  pairs: MatchingPair[]
  timeLimit: number // seconds per question set
  points: number
}

interface MatchingResults {
  totalPairs: number
  correctMatches: number
  score: number
  timeSpent: number
  quizData: MatchingQuizData
}

// Sample matching quiz data
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
  timeLimit: 120, // 2 minutes for all pairs
  points: 10
}

// Utility function to shuffle array
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
  
  // Get quiz data from navigation state or use sample data
  const quizData: MatchingQuizData = location.state?.quizData || sampleMatchingData
  
  // Refs for drawing connection lines
  const containerRef = useRef<HTMLDivElement>(null)
  const leftItemRefs = useRef<Map<string, HTMLDivElement>>(new Map())
  const rightItemRefs = useRef<Map<string, HTMLDivElement>>(new Map())
  
  // State
  const [shuffledLeft, setShuffledLeft] = useState<MatchingPair[]>([])
  const [shuffledRight, setShuffledRight] = useState<MatchingPair[]>([])
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null)
  const [selectedRight, setSelectedRight] = useState<string | null>(null)
  const [matches, setMatches] = useState<Map<string, string>>(new Map()) // leftId -> rightId
  const [correctMatches, setCorrectMatches] = useState<Set<string>>(new Set())
  const [incorrectAttempts, setIncorrectAttempts] = useState<Set<string>>(new Set())
  const [timeRemaining, setTimeRemaining] = useState(quizData.timeLimit)
  const [isComplete, setIsComplete] = useState(false)
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false)
  const [connectionLines, setConnectionLines] = useState<Array<{
    startX: number
    startY: number
    endX: number
    endY: number
    isCorrect: boolean
    id: string
  }>>([])

  // Initialize shuffled arrays
  useEffect(() => {
    setShuffledLeft(shuffleArray(quizData.pairs))
    setShuffledRight(shuffleArray(quizData.pairs))
  }, [quizData.pairs])

  // Timer countdown
  useEffect(() => {
    if (isComplete || timeRemaining <= 0) return

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          setIsComplete(true)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [isComplete, timeRemaining])

  // Check if all pairs are matched correctly
  useEffect(() => {
    if (correctMatches.size === quizData.pairs.length) {
      setIsComplete(true)
    }
  }, [correctMatches.size, quizData.pairs.length])

  // Update connection lines when matches change
  const updateConnectionLines = useCallback(() => {
    if (!containerRef.current) return

    const containerRect = containerRef.current.getBoundingClientRect()
    const lines: typeof connectionLines = []

    matches.forEach((rightId, leftId) => {
      const leftEl = leftItemRefs.current.get(leftId)
      const rightEl = rightItemRefs.current.get(rightId)

      if (leftEl && rightEl) {
        const leftRect = leftEl.getBoundingClientRect()
        const rightRect = rightEl.getBoundingClientRect()

        lines.push({
          startX: leftRect.right - containerRect.left,
          startY: leftRect.top + leftRect.height / 2 - containerRect.top,
          endX: rightRect.left - containerRect.left,
          endY: rightRect.top + rightRect.height / 2 - containerRect.top,
          isCorrect: correctMatches.has(leftId),
          id: `${leftId}-${rightId}`
        })
      }
    })

    setConnectionLines(lines)
  }, [matches, correctMatches])

  useEffect(() => {
    updateConnectionLines()
    // Also update on window resize
    window.addEventListener('resize', updateConnectionLines)
    return () => window.removeEventListener('resize', updateConnectionLines)
  }, [updateConnectionLines])

  // Handle left item click
  const handleLeftClick = (pair: MatchingPair) => {
    if (isComplete || correctMatches.has(pair.id)) return
    
    if (selectedLeft === pair.id) {
      setSelectedLeft(null)
    } else {
      setSelectedLeft(pair.id)
      
      // If right is already selected, try to match
      if (selectedRight) {
        tryMatch(pair.id, selectedRight)
      }
    }
  }

  // Handle right item click
  const handleRightClick = (pair: MatchingPair) => {
    if (isComplete) return
    
    // Check if this right item is already matched correctly
    const isAlreadyMatched = Array.from(matches.entries()).some(
      ([leftId, rightId]) => rightId === pair.id && correctMatches.has(leftId)
    )
    if (isAlreadyMatched) return

    if (selectedRight === pair.id) {
      setSelectedRight(null)
    } else {
      setSelectedRight(pair.id)
      
      // If left is already selected, try to match
      if (selectedLeft) {
        tryMatch(selectedLeft, pair.id)
      }
    }
  }

  // Try to match selected items
  const tryMatch = (leftId: string, rightId: string) => {
    const leftPair = quizData.pairs.find(p => p.id === leftId)
    const rightPair = quizData.pairs.find(p => p.id === rightId)

    if (!leftPair || !rightPair) return

    // Remove any existing match for this left item
    const newMatches = new Map(matches)
    newMatches.set(leftId, rightId)
    setMatches(newMatches)

    // Check if match is correct
    if (leftPair.id === rightPair.id) {
      // Correct match!
      setCorrectMatches(prev => new Set([...prev, leftId]))
      setIncorrectAttempts(prev => {
        const newSet = new Set(prev)
        newSet.delete(leftId)
        return newSet
      })
    } else {
      // Incorrect match
      setIncorrectAttempts(prev => new Set([...prev, leftId]))
    }

    // Clear selections
    setSelectedLeft(null)
    setSelectedRight(null)
  }

  // Handle quiz completion
  const handleComplete = useCallback(() => {
    const results: MatchingResults = {
      totalPairs: quizData.pairs.length,
      correctMatches: correctMatches.size,
      score: Math.round((correctMatches.size / quizData.pairs.length) * 100),
      timeSpent: quizData.timeLimit - timeRemaining,
      quizData
    }

    navigate('/quiz-results', { 
      state: { 
        results: {
          totalQuestions: results.totalPairs,
          correctAnswers: results.correctMatches,
          score: results.score,
          answers: [], // Not applicable for matching
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
  }, [correctMatches.size, navigate, quizData, timeRemaining])

  // Submit quiz
  const handleSubmit = () => {
    setIsComplete(true)
    handleComplete()
  }

  const handleLeaveQuiz = () => {
    setShowLeaveConfirm(true)
  }

  const confirmLeaveQuiz = () => {
    navigate('/home')
  }

  const timerPercentage = (timeRemaining / quizData.timeLimit) * 100
  const progressPercentage = (correctMatches.size / quizData.pairs.length) * 100

  // Format time as MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="h-screen w-screen relative overflow-hidden">
      {/* Ambient background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-hive-purple/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-hive-blue/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-hive-pink/5 rounded-full blur-3xl" />
      </div>

      {/* Left 3D Mascot - Bird */}
      <div className="absolute -left-10 bottom-32 w-[500px] h-[550px] z-10 pointer-events-none">
        <QuizBirdMascot />
      </div>

      {/* Right 3D Mascot - Octopus */}
      <div className="absolute right-0 -bottom-24 w-[700px] h-[800px] z-10 pointer-events-none">
        <QuizOctopusMascot />
      </div>

      {/* Main Content */}
      <div className="relative z-20 h-full flex flex-col">
        {/* Header */}
        <nav className="flex-shrink-0 px-8 py-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <a 
              href="/home" 
              className="text-2xl font-display font-bold tracking-wider text-white
                         hover:text-hive-purple-light transition-colors duration-300 italic"
            >
              TestHive
            </a>
            <h2 className="text-xl font-display font-medium text-white tracking-wide">
              Matching Quiz
            </h2>
            <button
              onClick={handleLeaveQuiz}
              className="px-6 py-2.5 border border-hive-purple/40 text-white/90 rounded-lg 
                         hover:bg-hive-purple/10 hover:border-hive-purple transition-all duration-300 
                         text-sm font-medium font-body"
            >
              Leave Quiz
            </button>
          </div>
        </nav>

        {/* Progress & Timer Section */}
        <div className="flex-shrink-0 px-8 py-4">
          <div className="max-w-4xl mx-auto flex items-center justify-between gap-8">
            {/* Timer */}
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white/60 text-sm font-body">Time Remaining</span>
                <span className={`text-lg font-bold font-display ${
                  timerPercentage <= 25 ? 'text-red-400' : 
                  timerPercentage <= 50 ? 'text-yellow-400' : 'text-hive-blue'
                }`}>
                  {formatTime(timeRemaining)}
                </span>
              </div>
              <div className="h-3 bg-dark-600/50 rounded-full overflow-hidden border border-white/5">
                <div 
                  className="h-full rounded-full transition-all duration-1000 ease-linear relative"
                  style={{ 
                    width: `${timerPercentage}%`,
                    background: timerPercentage > 50 
                      ? 'linear-gradient(90deg, #3B82F6, #60a5fa)' 
                      : timerPercentage > 25 
                        ? 'linear-gradient(90deg, #d97706, #fbbf24)' 
                        : 'linear-gradient(90deg, #dc2626, #f87171)'
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-transparent to-white/20" />
                </div>
              </div>
            </div>

            {/* Progress */}
            <div className="text-right">
              <p className="text-white/80 text-sm font-medium tracking-wide font-body">Pairs Matched</p>
              <p className="text-white text-3xl font-bold mt-1 font-display">
                <span className="text-hive-purple-light">{correctMatches.size}</span>
                <span className="text-white/40">/</span>
                <span>{quizData.pairs.length}</span>
              </p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="max-w-4xl mx-auto mt-4">
            <div className="h-2 bg-dark-600/50 rounded-full overflow-hidden border border-white/5">
              <div 
                className="h-full rounded-full transition-all duration-500 ease-out"
                style={{ 
                  width: `${progressPercentage}%`,
                  background: 'linear-gradient(90deg, #9333EA, #EC4899)'
                }}
              />
            </div>
          </div>
        </div>

        {/* Matching Area */}
        <div className="flex-1 px-8 py-4 overflow-y-auto">
          <div 
            ref={containerRef}
            className="max-w-4xl mx-auto relative min-h-full"
          >
            {/* SVG Connection Lines - positioned to cover the full scrollable area */}
            <svg className="absolute top-0 left-0 w-full pointer-events-none z-10" style={{ height: '100%', minHeight: '100%' }}>
              <defs>
                <linearGradient id="correctGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#22c55e" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#4ade80" stopOpacity="0.8" />
                </linearGradient>
                <linearGradient id="incorrectGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#ef4444" stopOpacity="0.6" />
                  <stop offset="100%" stopColor="#f87171" stopOpacity="0.6" />
                </linearGradient>
                <linearGradient id="pendingGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#9333EA" stopOpacity="0.5" />
                  <stop offset="100%" stopColor="#EC4899" stopOpacity="0.5" />
                </linearGradient>
              </defs>
              {connectionLines.map(line => (
                <g key={line.id}>
                  {/* Glow effect */}
                  <path
                    d={`M ${line.startX} ${line.startY} 
                        C ${line.startX + 50} ${line.startY},
                          ${line.endX - 50} ${line.endY},
                          ${line.endX} ${line.endY}`}
                    fill="none"
                    stroke={line.isCorrect ? '#22c55e' : '#ef4444'}
                    strokeWidth="8"
                    strokeOpacity="0.2"
                    filter="blur(4px)"
                  />
                  {/* Main line */}
                  <path
                    d={`M ${line.startX} ${line.startY} 
                        C ${line.startX + 50} ${line.startY},
                          ${line.endX - 50} ${line.endY},
                          ${line.endX} ${line.endY}`}
                    fill="none"
                    stroke={`url(#${line.isCorrect ? 'correctGradient' : 'incorrectGradient'})`}
                    strokeWidth="3"
                    strokeLinecap="round"
                    className="transition-all duration-300"
                  />
                  {/* Connection dots */}
                  <circle
                    cx={line.startX}
                    cy={line.startY}
                    r="6"
                    fill={line.isCorrect ? '#22c55e' : '#ef4444'}
                    className="transition-all duration-300"
                  />
                  <circle
                    cx={line.endX}
                    cy={line.endY}
                    r="6"
                    fill={line.isCorrect ? '#22c55e' : '#ef4444'}
                    className="transition-all duration-300"
                  />
                </g>
              ))}
            </svg>

            {/* Two Columns */}
            <div className="flex gap-16 justify-center pb-8">
              {/* Left Column - Terms */}
              <div className="flex flex-col gap-3 w-64">
                <h3 className="text-white/60 text-sm font-medium mb-2 text-center font-body uppercase tracking-wider">
                  Terms
                </h3>
                {shuffledLeft.map((pair) => {
                  const isMatched = correctMatches.has(pair.id)
                  const isIncorrect = incorrectAttempts.has(pair.id) && !isMatched
                  const isSelected = selectedLeft === pair.id

                  return (
                    <div
                      key={pair.id}
                      ref={(el) => {
                        if (el) leftItemRefs.current.set(pair.id, el)
                      }}
                      onClick={() => handleLeftClick(pair)}
                      className={`
                        relative p-4 rounded-xl cursor-pointer transition-all duration-300
                        border-2 font-body text-center
                        ${isMatched 
                          ? 'bg-green-500/20 border-green-500/50 text-green-300 cursor-default' 
                          : isSelected
                            ? 'bg-hive-purple/30 border-hive-purple text-white scale-105 shadow-lg shadow-hive-purple/30'
                            : isIncorrect
                              ? 'bg-red-500/10 border-red-500/30 text-white hover:bg-red-500/20'
                              : 'bg-dark-600/50 border-white/10 text-white/90 hover:bg-dark-500/50 hover:border-hive-purple/50'
                        }
                      `}
                    >
                      {/* Status Icon */}
                      {isMatched && (
                        <div className="absolute -top-2 -right-2 bg-green-500 rounded-full p-1">
                          <CheckCircle size={14} className="text-white" />
                        </div>
                      )}
                      {isIncorrect && !isMatched && (
                        <div className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1">
                          <XCircle size={14} className="text-white" />
                        </div>
                      )}
                      
                      <span className="font-semibold text-lg">{pair.left}</span>
                    </div>
                  )
                })}
              </div>

              {/* Right Column - Definitions */}
              <div className="flex flex-col gap-3 w-72">
                <h3 className="text-white/60 text-sm font-medium mb-2 text-center font-body uppercase tracking-wider">
                  Definitions
                </h3>
                {shuffledRight.map((pair) => {
                  // Check if this definition is already correctly matched
                  const isUsed = Array.from(matches.entries()).some(
                    ([leftId, rightId]) => rightId === pair.id && correctMatches.has(leftId)
                  )
                  const isSelected = selectedRight === pair.id

                  return (
                    <div
                      key={`right-${pair.id}`}
                      ref={(el) => {
                        if (el) rightItemRefs.current.set(pair.id, el)
                      }}
                      onClick={() => handleRightClick(pair)}
                      className={`
                        relative p-4 rounded-xl cursor-pointer transition-all duration-300
                        border-2 font-body text-center text-sm
                        ${isUsed 
                          ? 'bg-green-500/20 border-green-500/50 text-green-300 cursor-default opacity-60' 
                          : isSelected
                            ? 'bg-hive-pink/30 border-hive-pink text-white scale-105 shadow-lg shadow-hive-pink/30'
                            : 'bg-dark-600/50 border-white/10 text-white/90 hover:bg-dark-500/50 hover:border-hive-pink/50'
                        }
                      `}
                    >
                      {isUsed && (
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

        {/* Submit Button */}
        <div className="flex-shrink-0 px-8 py-4">
          <div className="max-w-4xl mx-auto flex justify-center">
            <button
              onClick={handleSubmit}
              className="px-12 py-4 bg-gradient-to-r from-hive-purple to-hive-pink text-white rounded-xl
                         hover:from-hive-purple-light hover:to-hive-pink transition-all duration-300
                         font-semibold text-lg shadow-lg shadow-hive-purple/30 font-body
                         disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isComplete ? 'View Results' : `Submit (${correctMatches.size}/${quizData.pairs.length} matched)`}
            </button>
          </div>
        </div>
      </div>

      {/* Leave Confirmation Modal */}
      {showLeaveConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-dark-600 border border-hive-purple/30 rounded-2xl p-8 max-w-md mx-4 shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-4 font-display">Leave Quiz?</h3>
            <p className="text-white/70 mb-6 font-body">
              Your progress will be lost. Are you sure you want to leave?
            </p>
            <div className="flex gap-4 justify-end">
              <button
                onClick={() => setShowLeaveConfirm(false)}
                className="px-6 py-2.5 bg-dark-500 text-white/80 rounded-lg hover:bg-dark-500/80
                           transition-all duration-300 font-body"
              >
                Cancel
              </button>
              <button
                onClick={confirmLeaveQuiz}
                className="px-6 py-2.5 bg-red-500/80 text-white rounded-lg hover:bg-red-500
                           transition-all duration-300 font-body"
              >
                Leave
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default MatchingQuiz