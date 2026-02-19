import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { quizAPI } from '../services/api'

// Import 3D Mascot Components (updated with battleState prop)
import QuizBirdMascot from '../components/three/QuizBirdMascot'
import QuizOctopusMascot from '../components/three/QuizOctopusMascot'

// Import Battle System
import { BattleHPBar, BattleEffects, useBattleSystem, BATTLE_CONFIG } from '../components/battle'

// Types
interface QuizOption {
  text: string
  isCorrect: boolean
}

interface QuizQuestion {
  questionText: string
  options: QuizOption[]
  timeLimit: number
  points: number
}

interface QuizData {
  title: string
  questions: QuizQuestion[]
  _id?: string  // from database
}

interface QuizResults {
  totalQuestions: number
  correctAnswers: number
  score: number
  answers: (number | null)[]
  quizData: QuizData
}

// Sample quiz data
const sampleQuizData: QuizData = {
  title: "HTTP Status Codes Quiz",
  questions: [
    {
      questionText: "Which HTTP status code means the requested resource was found but moved permanently to a new URL?",
      options: [
        { text: "200", isCorrect: false },
        { text: "301", isCorrect: true },
        { text: "404", isCorrect: false },
        { text: "500", isCorrect: false }
      ],
      timeLimit: 30,
      points: 10
    },
    {
      questionText: "Which HTTP status code indicates a successful request?",
      options: [
        { text: "200", isCorrect: true },
        { text: "301", isCorrect: false },
        { text: "404", isCorrect: false },
        { text: "500", isCorrect: false }
      ],
      timeLimit: 30,
      points: 10
    },
    {
      questionText: "Which HTTP status code means 'Not Found'?",
      options: [
        { text: "200", isCorrect: false },
        { text: "301", isCorrect: false },
        { text: "404", isCorrect: true },
        { text: "500", isCorrect: false }
      ],
      timeLimit: 30,
      points: 10
    },
    {
      questionText: "Which HTTP status code indicates an Internal Server Error?",
      options: [
        { text: "200", isCorrect: false },
        { text: "301", isCorrect: false },
        { text: "404", isCorrect: false },
        { text: "500", isCorrect: true }
      ],
      timeLimit: 30,
      points: 10
    },
    {
      questionText: "Which HTTP status code means 'Bad Request'?",
      options: [
        { text: "400", isCorrect: true },
        { text: "401", isCorrect: false },
        { text: "403", isCorrect: false },
        { text: "405", isCorrect: false }
      ],
      timeLimit: 30,
      points: 10
    },
    {
      questionText: "Which HTTP status code indicates 'Unauthorized'?",
      options: [
        { text: "400", isCorrect: false },
        { text: "401", isCorrect: true },
        { text: "403", isCorrect: false },
        { text: "405", isCorrect: false }
      ],
      timeLimit: 30,
      points: 10
    },
    {
      questionText: "Which HTTP status code means 'Forbidden'?",
      options: [
        { text: "400", isCorrect: false },
        { text: "401", isCorrect: false },
        { text: "403", isCorrect: true },
        { text: "405", isCorrect: false }
      ],
      timeLimit: 30,
      points: 10
    },
    {
      questionText: "Which HTTP status code indicates 'No Content'?",
      options: [
        { text: "200", isCorrect: false },
        { text: "201", isCorrect: false },
        { text: "202", isCorrect: false },
        { text: "204", isCorrect: true }
      ],
      timeLimit: 30,
      points: 10
    },
    {
      questionText: "Which HTTP status code indicates a temporary redirect?",
      options: [
        { text: "301", isCorrect: false },
        { text: "302", isCorrect: true },
        { text: "304", isCorrect: false },
        { text: "307", isCorrect: false }
      ],
      timeLimit: 30,
      points: 10
    }
  ]
}

const MultipleChoiceQuiz = () => {
  const navigate = useNavigate()
  const location = useLocation()
  
  const quizData: QuizData = location.state?.quizData || sampleQuizData
  const totalQuestions = quizData.questions.length

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState<(number | null)[]>(
    Array(totalQuestions).fill(null)
  )
  const [timeRemaining, setTimeRemaining] = useState(quizData.questions[0]?.timeLimit || 30)
  const [totalTimeLimit] = useState(quizData.questions[0]?.timeLimit || 30)
  const [isQuizComplete, setIsQuizComplete] = useState(false)
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false)
  
  // Track how many questions have been answered
  const [answeredCount, setAnsweredCount] = useState(0)
  
  // ─── BATTLE SYSTEM (pass totalQuestions for dynamic HP scaling) ───
  const [battle, battleActions] = useBattleSystem(totalQuestions)
  const [isAnswerLocked, setIsAnswerLocked] = useState(false)
  const [lastAnswerResult, setLastAnswerResult] = useState<'correct' | 'wrong' | null>(null)
  const [lastAnswerIndex, setLastAnswerIndex] = useState<number | null>(null)

  const currentQuestion = quizData.questions[currentQuestionIndex]

  // ─── AUTO-END QUIZ WHEN BIRD HP REACHES 0 ─────────────────────
  useEffect(() => {
    if (battle.birdDefeated && !isQuizComplete) {
      // Bird (player) is defeated — auto-submit after a short delay for the animation to play
      const timeout = setTimeout(() => {
        handleSubmitQuiz()
      }, BATTLE_CONFIG.NEXT_QUESTION_DELAY)
      return () => clearTimeout(timeout)
    }
  }, [battle.birdDefeated, isQuizComplete])

  // Timer
  useEffect(() => {
    if (isQuizComplete || battle.birdDefeated) return

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          // Time ran out — count as wrong answer
          battleActions.triggerWrongAnswer()
          setAnsweredCount(prev => prev + 1)
          
          if (currentQuestionIndex < totalQuestions - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1)
            return quizData.questions[currentQuestionIndex + 1]?.timeLimit || 30
          } else {
            setIsQuizComplete(true)
            return 0
          }
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [currentQuestionIndex, isQuizComplete, totalQuestions, quizData.questions, battle.birdDefeated])

  useEffect(() => {
    setTimeRemaining(currentQuestion?.timeLimit || 30)
  }, [currentQuestionIndex, currentQuestion?.timeLimit])

  // ─── ANSWER HANDLER (with battle trigger) ──────────────────
  const handleAnswerSelect = (optionIndex: number) => {
    if (isAnswerLocked || battle.birdDefeated) return
    
    const newAnswers = [...selectedAnswers]
    newAnswers[currentQuestionIndex] = optionIndex
    setSelectedAnswers(newAnswers)

    const isCorrect = currentQuestion.options[optionIndex].isCorrect
    
    // Lock answers and show result
    setIsAnswerLocked(true)
    setLastAnswerResult(isCorrect ? 'correct' : 'wrong')
    setLastAnswerIndex(optionIndex)
    setAnsweredCount(prev => prev + 1)

    // Trigger battle animation
    if (isCorrect) {
      battleActions.triggerCorrectAnswer()
    } else {
      battleActions.triggerWrongAnswer()
    }

    // Auto-advance after animation (unless bird is defeated — that's handled by the useEffect above)
    setTimeout(() => {
      setLastAnswerResult(null)
      setLastAnswerIndex(null)
      setIsAnswerLocked(false)

      if (currentQuestionIndex < totalQuestions - 1) {
        setCurrentQuestionIndex(prev => prev + 1)
      } else {
        handleSubmitQuiz()
      }
    }, BATTLE_CONFIG.NEXT_QUESTION_DELAY)
  }

  const handlePrevious = () => {
    if (currentQuestionIndex > 0 && !isAnswerLocked) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
      setLastAnswerResult(null)
      setLastAnswerIndex(null)
    }
  }

  const handleNext = () => {
    if (isAnswerLocked) return
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    } else {
      handleSubmitQuiz()
    }
  }

  const handleSubmitQuiz = useCallback(async () => {
    if (isQuizComplete) return
    setIsQuizComplete(true)
    
    let correctCount = 0
    quizData.questions.forEach((question, index) => {
      if (selectedAnswers[index] !== null && question.options[selectedAnswers[index]!]?.isCorrect) {
        correctCount++
      }
    })

    const accuracy = Math.round((correctCount / totalQuestions) * 100)

    const results: QuizResults = {
      totalQuestions,
      correctAnswers: correctCount,
      score: accuracy,
      answers: selectedAnswers,
      quizData
    }

    // Save attempt to backend if quiz has a DB id
    if (quizData._id) {
      try {
        await quizAPI.submitAttempt(quizData._id, {
          score: accuracy,
          totalQuestions,
          correctAnswers: correctCount,
          accuracy,
          timeSpentSeconds: 0,
          answers: selectedAnswers.map((ansIdx, qIdx) => ({
            questionIndex: qIdx,
            userAnswer: ansIdx,
            isCorrect: ansIdx !== null && quizData.questions[qIdx]?.options[ansIdx]?.isCorrect,
            timeSpentSeconds: 0,
          })),
        })
      } catch (err) {
        console.error('Failed to save attempt:', err)
      }
    }

    navigate('/quiz-results', { state: { results } })
  }, [selectedAnswers, quizData, totalQuestions, navigate, isQuizComplete])

  const handleLeaveQuiz = () => {
    setShowLeaveConfirm(true)
  }

  const confirmLeaveQuiz = () => {
    navigate('/home')
  }

  const timerPercentage = (timeRemaining / totalTimeLimit) * 100

  // Determine option styling
  const getOptionStyle = (index: number) => {
    const isSelected = selectedAnswers[currentQuestionIndex] === index
    const isShowingResult = lastAnswerResult !== null
    const isCorrectOption = currentQuestion.options[index].isCorrect
    const wasJustSelected = lastAnswerIndex === index

    if (isShowingResult && isCorrectOption) {
      return {
        background: 'linear-gradient(135deg, #166534 0%, #15803d 50%, #16a34a 100%)',
        border: '2px solid rgba(34, 197, 94, 0.7)',
        className: 'shadow-lg shadow-green-500/30 scale-[1.03]'
      }
    }
    if (isShowingResult && wasJustSelected && !isCorrectOption) {
      return {
        background: 'linear-gradient(135deg, #7f1d1d 0%, #991b1b 50%, #b91c1c 100%)',
        border: '2px solid rgba(239, 68, 68, 0.7)',
        className: 'shadow-lg shadow-red-500/30 animate-battle-wrong-shake'
      }
    }
    if (isSelected && !isShowingResult) {
      return {
        background: 'linear-gradient(135deg, #9333EA 0%, #7C3AED 50%, #6D28D9 100%)',
        border: '2px solid rgba(168, 85, 247, 0.6)',
        className: 'shadow-lg shadow-hive-purple/25'
      }
    }
    return {
      background: 'linear-gradient(135deg, #1a1a2e 0%, #0f0f1a 100%)',
      border: '2px solid rgba(59, 130, 246, 0.25)',
      className: ''
    }
  }

  return (
    <div className={`h-screen w-screen relative overflow-hidden
                     ${battle.screenShake ? 'animate-battle-screen-shake' : ''}`}>
      {/* Ambient background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-hive-purple/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-hive-blue/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-hive-purple/5 rounded-full blur-3xl" />
      </div>

      {/* ─── LEFT HP BAR ─── */}
      <div className="absolute top-[280px] left-60 z-30 pointer-events-none">
        <BattleHPBar
          current={battle.birdHP}
          max={BATTLE_CONFIG.BIRD_MAX_HP}
          name="Bird"
          side="left"
          isHit={battle.isBirdHit}
        />
      </div>
      {/* ─── LEFT MASCOT: BIRD (Player) ─── */}
      <div className="absolute -left-10 bottom-2 w-[860px] h-[920px] z-10 pointer-events-none overflow-visible">
        <QuizBirdMascot battleState={battle.birdState} />
      </div>

      {/* ─── RIGHT HP BAR ─── */}
      <div className="absolute top-[280px] right-20 z-30 pointer-events-none">
        <BattleHPBar
          current={battle.octopusHP}
          max={BATTLE_CONFIG.OCTOPUS_MAX_HP}
          name="Octopus"
          side="right"
          isHit={battle.isOctopusHit}
        />
      </div>
      {/* ─── RIGHT MASCOT: OCTOPUS (Enemy) ─── */}
      <div className="absolute -right-12 -bottom-20 w-[780px] h-[880px] z-10 pointer-events-none overflow-visible">
        <QuizOctopusMascot battleState={battle.octopusState} />
      </div>



      {/* ─── BATTLE EFFECTS LAYER ───────────────────────────────── */}
      <div className="absolute inset-0 z-25 pointer-events-none">
        <BattleEffects
          lastAction={battle.lastAction}
          comboCount={battle.comboCount}
        />
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
              Multiple choices
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

        {/* Timer & Progress */}
        <div className="flex-shrink-0 px-8 py-2">
          <div className="max-w-4xl mx-auto flex items-center justify-between gap-8">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white/60 text-sm font-body">Time Remaining</span>
                <span className={`text-lg font-bold font-display ${
                  timerPercentage <= 25 ? 'text-red-400' : 
                  timerPercentage <= 50 ? 'text-yellow-400' : 'text-hive-blue'
                }`}>
                  {timeRemaining}s
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
            <div className="text-right">
              <p className="text-white/80 text-sm font-medium tracking-wide font-body">Question</p>
              <p className="text-white text-3xl font-bold mt-1 font-display">
                <span className="text-hive-purple-light">{answeredCount}</span>
                <span className="text-white/40">/</span>
                <span>{totalQuestions}</span>
              </p>
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

        {/* Question Card */}
        <div className="flex-shrink-0 flex justify-center px-8 py-4">
          <div className="relative w-full max-w-2xl">
            <div className="absolute inset-0 bg-hive-blue/20 rounded-2xl blur-xl transform scale-105" />
            <div className="relative bg-gradient-to-br from-dark-600/90 to-dark-700/90 backdrop-blur-md 
                            border border-hive-blue/30 rounded-2xl p-6 shadow-2xl">
              <p className="text-white text-lg text-center leading-relaxed font-medium font-body">
                {currentQuestion.questionText}
              </p>
            </div>
          </div>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Navigation Buttons */}
        <div className="flex-shrink-0 flex items-center justify-center gap-6 py-4">
          <button
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0 || isAnswerLocked || battle.birdDefeated}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg transition-all duration-300 font-body
                       ${currentQuestionIndex === 0 || isAnswerLocked || battle.birdDefeated
                         ? 'bg-dark-600/30 text-white/30 cursor-not-allowed' 
                         : 'bg-dark-600/50 text-white/90 hover:bg-dark-500/50 border border-white/10'}`}
          >
            <ChevronLeft size={18} />
            <span className="text-sm font-medium">Previous</span>
          </button>
          
          <button
            onClick={handleNext}
            disabled={isAnswerLocked || battle.birdDefeated}
            className="flex items-center gap-2 px-5 py-2.5 bg-dark-600/50 text-white/90 rounded-lg 
                       hover:bg-dark-500/50 transition-all duration-300 border border-white/10 font-body
                       disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="text-sm font-medium">
              {currentQuestionIndex === totalQuestions - 1 ? 'Finish' : 'Next'}
            </span>
            <ChevronRight size={18} />
          </button>
        </div>

        {/* Answer Options */}
        <div className="flex-shrink-0 flex justify-center px-8 pb-8">
        <div className="w-full max-w-4xl grid grid-cols-2 gap-4">
          {currentQuestion.options.map((option, index) => {
            const style = getOptionStyle(index)
            
            return (
              <button
                key={index}
                onClick={() => handleAnswerSelect(index)}
                disabled={isAnswerLocked || battle.birdDefeated}
                className={`relative min-h-[120px] py-8 px-8 rounded-2xl text-xl font-bold transition-all duration-300 
                          transform hover:scale-[1.02] overflow-hidden group font-body
                          text-white/90 hover:shadow-lg hover:shadow-hive-purple/10
                          disabled:hover:scale-100 flex items-center justify-center text-center
                          ${style.className}`}
                  style={{
                    background: style.background,
                    border: style.border,
                  }}
                >
                  <div className={`absolute inset-0 bg-gradient-to-r from-hive-purple/0 via-hive-purple/10 to-hive-purple/0 
                                  opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                  <span className="relative z-10">{option.text}</span>
                  
                  {/* Correct/Wrong indicators */}
                  {lastAnswerResult && currentQuestion.options[index].isCorrect && (
                    <span className="absolute top-2 right-2 text-sm">✅</span>
                  )}
                  {lastAnswerResult && lastAnswerIndex === index && !currentQuestion.options[index].isCorrect && (
                    <span className="absolute top-2 right-2 text-sm">❌</span>
                  )}
                </button>
              )
            })}
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
        </div>
      )}
    </div>
  )
}

export default MultipleChoiceQuiz