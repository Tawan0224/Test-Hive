import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { ChevronLeft, ChevronRight } from 'lucide-react'

// Import 3D Mascot Components
import QuizBirdMascot from '../components/three/QuizBirdMascot'
import QuizOctopusMascot from '../components/three/QuizOctopusMascot'

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
      questionText: "Which HTTP status code indicates 'Created'?",
      options: [
        { text: "200", isCorrect: false },
        { text: "201", isCorrect: true },
        { text: "202", isCorrect: false },
        { text: "204", isCorrect: false }
      ],
      timeLimit: 30,
      points: 10
    },
    {
      questionText: "Which HTTP status code means 'No Content'?",
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

  const currentQuestion = quizData.questions[currentQuestionIndex]

  useEffect(() => {
    if (isQuizComplete) return

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
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
  }, [currentQuestionIndex, isQuizComplete, totalQuestions, quizData.questions])

  useEffect(() => {
    setTimeRemaining(currentQuestion?.timeLimit || 30)
  }, [currentQuestionIndex, currentQuestion?.timeLimit])

  const handleAnswerSelect = (optionIndex: number) => {
    const newAnswers = [...selectedAnswers]
    newAnswers[currentQuestionIndex] = optionIndex
    setSelectedAnswers(newAnswers)
  }

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
    }
  }

  const handleNext = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    } else {
      handleSubmitQuiz()
    }
  }

  const handleSubmitQuiz = useCallback(() => {
    let correctCount = 0
    quizData.questions.forEach((question, index) => {
      if (selectedAnswers[index] !== null && question.options[selectedAnswers[index]!]?.isCorrect) {
        correctCount++
      }
    })

    const results: QuizResults = {
      totalQuestions,
      correctAnswers: correctCount,
      score: Math.round((correctCount / totalQuestions) * 100),
      answers: selectedAnswers,
      quizData
    }

    navigate('/quiz-results', { state: { results } })
  }, [selectedAnswers, quizData, totalQuestions, navigate])

  const handleLeaveQuiz = () => {
    setShowLeaveConfirm(true)
  }

  const confirmLeaveQuiz = () => {
    navigate('/home')
  }

  const timerPercentage = (timeRemaining / totalTimeLimit) * 100

  return (
    <div className="h-screen w-screen relative overflow-hidden">
      {/* Ambient background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-hive-purple/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-hive-blue/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-hive-purple/5 rounded-full blur-3xl" />
      </div>

      {/* Left 3D Mascot - Bird - MOVED HIGHER with bottom-20 */}
      <div className="absolute -left-10 bottom-32 w-[500px] h-[550px] z-10 pointer-events-none">
        <QuizBirdMascot />
      </div>

      {/* Right 3D Mascot - Octopus - MOVED LOWER with -bottom-16 */}
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
              Multiple choices
            </h2>
            <button
              onClick={handleLeaveQuiz}
              className="px-6 py-2.5 border border-hive-purple/40 text-white/90 rounded-lg 
                         hover:bg-hive-purple/15 hover:border-hive-purple-light/60 transition-all duration-300
                         uppercase tracking-widest text-xs font-semibold backdrop-blur-sm"
            >
              Leave Quiz
            </button>
          </div>
        </nav>

        {/* Timer and Progress */}
        <div className="flex-shrink-0 px-8 py-2">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <div className="flex-1 mr-8">
              <div className="flex items-center gap-4 mb-2">
                <span className="text-white/70 text-sm font-medium tracking-wide font-body">Time Remaining</span>
                <span className="text-white font-bold text-lg font-display">{timeRemaining}s</span>
              </div>
              <div className="h-3 bg-dark-600/50 rounded-full overflow-hidden backdrop-blur-sm border border-white/5">
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
              <p className="text-white/80 text-sm font-medium tracking-wide font-body">Question Completed</p>
              <p className="text-white text-3xl font-bold mt-1 font-display">
                <span className="text-hive-purple-light">{currentQuestionIndex + 1}</span>
                <span className="text-white/40">/</span>
                <span>{totalQuestions}</span>
              </p>
            </div>
          </div>
        </div>

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

        {/* Spacer - pushes content to fill middle */}
        <div className="flex-1" />

        {/* Navigation Buttons */}
        <div className="flex-shrink-0 flex items-center justify-center gap-6 py-4">
          <button
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg transition-all duration-300 font-body
                       ${currentQuestionIndex === 0 
                         ? 'bg-dark-600/30 text-white/30 cursor-not-allowed' 
                         : 'bg-dark-600/50 text-white/90 hover:bg-dark-500/50 border border-white/10'}`}
          >
            <ChevronLeft size={18} />
            <span className="text-sm font-medium">Previous</span>
          </button>
          
          <button
            onClick={handleNext}
            className="flex items-center gap-2 px-5 py-2.5 bg-dark-600/50 text-white/90 rounded-lg 
                       hover:bg-dark-500/50 transition-all duration-300 border border-white/10 font-body"
          >
            <span className="text-sm font-medium">
              {currentQuestionIndex === totalQuestions - 1 ? 'Finish' : 'Next'}
            </span>
            <ChevronRight size={18} />
          </button>
        </div>

        {/* Answer Options */}
        <div className="flex-shrink-0 flex justify-center px-8 pb-8">
          <div className="w-full max-w-4xl grid grid-cols-2 md:grid-cols-4 gap-4">
            {currentQuestion.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswerSelect(index)}
                className={`relative py-5 px-6 rounded-xl text-2xl font-bold transition-all duration-300 
                           transform hover:scale-[1.03] overflow-hidden group font-body
                           ${selectedAnswers[currentQuestionIndex] === index
                             ? 'text-white shadow-lg shadow-hive-purple/25'
                             : 'text-white/90 hover:shadow-lg hover:shadow-hive-purple/10'
                           }`}
                style={{
                  background: selectedAnswers[currentQuestionIndex] === index
                    ? 'linear-gradient(135deg, #9333EA 0%, #7C3AED 50%, #6D28D9 100%)'
                    : 'linear-gradient(135deg, #1a1a2e 0%, #0f0f1a 100%)',
                  border: selectedAnswers[currentQuestionIndex] === index
                    ? '2px solid rgba(168, 85, 247, 0.6)'
                    : '2px solid rgba(59, 130, 246, 0.25)'
                }}
              >
                <div className={`absolute inset-0 bg-gradient-to-r from-hive-purple/0 via-hive-purple/10 to-hive-purple/0 
                                opacity-0 group-hover:opacity-100 transition-opacity duration-300
                                ${selectedAnswers[currentQuestionIndex] === index ? 'opacity-100' : ''}`} />
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                <span className="relative z-10">{option.text}</span>
              </button>
            ))}
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
              <div className="flex gap-4">
                <button
                  onClick={() => setShowLeaveConfirm(false)}
                  className="flex-1 py-3 px-6 bg-dark-500/50 text-white rounded-xl 
                             hover:bg-dark-500 transition-all duration-300 font-medium font-body
                             border border-white/10"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmLeaveQuiz}
                  className="flex-1 py-3 px-6 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl 
                             hover:from-red-500 hover:to-red-600 transition-all duration-300 font-medium font-body
                             shadow-lg shadow-red-900/30"
                >
                  Leave Quiz
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