import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { ChevronLeft, ChevronRight } from 'lucide-react'

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

// Sample quiz data - in production, this would come from props or API
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

// Bird Mascot SVG Component
const BirdMascot = () => (
  <svg viewBox="0 0 200 250" className="w-full h-full drop-shadow-2xl">
    <defs>
      <linearGradient id="birdBody" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#64748b" />
        <stop offset="100%" stopColor="#334155" />
      </linearGradient>
      <linearGradient id="birdBelly" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#94a3b8" />
        <stop offset="100%" stopColor="#64748b" />
      </linearGradient>
      <linearGradient id="birdBeak" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#fbbf24" />
        <stop offset="100%" stopColor="#d97706" />
      </linearGradient>
      <linearGradient id="strap" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#c2410c" />
        <stop offset="100%" stopColor="#9a3412" />
      </linearGradient>
      <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="2" dy="4" stdDeviation="3" floodOpacity="0.3"/>
      </filter>
    </defs>
    
    {/* Body */}
    <ellipse cx="100" cy="160" rx="55" ry="70" fill="url(#birdBody)" filter="url(#shadow)" />
    
    {/* Belly */}
    <ellipse cx="100" cy="175" rx="35" ry="45" fill="url(#birdBelly)" />
    
    {/* Left Wing */}
    <ellipse cx="55" cy="140" rx="25" ry="45" fill="#475569" transform="rotate(-15, 55, 140)" />
    
    {/* Right Wing */}
    <ellipse cx="145" cy="140" rx="25" ry="45" fill="#475569" transform="rotate(15, 145, 140)" />
    
    {/* Head */}
    <circle cx="100" cy="75" r="40" fill="url(#birdBody)" filter="url(#shadow)" />
    
    {/* Face */}
    <circle cx="100" cy="80" r="32" fill="url(#birdBelly)" />
    
    {/* Left Eye */}
    <circle cx="85" cy="70" r="10" fill="#1e293b" />
    <circle cx="83" cy="68" r="4" fill="white" />
    
    {/* Right Eye */}
    <circle cx="115" cy="70" r="10" fill="#1e293b" />
    <circle cx="113" cy="68" r="4" fill="white" />
    
    {/* Beak */}
    <path d="M90 85 L100 100 L110 85 Z" fill="url(#birdBeak)" />
    
    {/* Strap/Belt */}
    <rect x="50" y="145" width="100" height="12" rx="2" fill="url(#strap)" />
    <circle cx="100" cy="151" r="6" fill="#fbbf24" />
    
    {/* Backpack */}
    <rect x="130" y="110" width="25" height="40" rx="5" fill="#92400e" />
    <rect x="133" y="115" width="19" height="8" rx="2" fill="#78350f" />
    
    {/* Feet */}
    <ellipse cx="80" cy="228" rx="15" ry="8" fill="url(#birdBeak)" />
    <ellipse cx="120" cy="228" rx="15" ry="8" fill="url(#birdBeak)" />
    
    {/* Tail feathers */}
    <ellipse cx="100" cy="225" rx="20" ry="8" fill="#334155" />
  </svg>
)

// Mole/Creature Mascot SVG Component
const MoleMascot = () => (
  <svg viewBox="0 0 250 180" className="w-full h-full drop-shadow-2xl">
    <defs>
      <linearGradient id="moleBody" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#f472b6" />
        <stop offset="50%" stopColor="#db2777" />
        <stop offset="100%" stopColor="#9d174d" />
      </linearGradient>
      <linearGradient id="moleBelly" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#fda4af" />
        <stop offset="100%" stopColor="#f472b6" />
      </linearGradient>
      <linearGradient id="moleSnout" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#fecdd3" />
        <stop offset="100%" stopColor="#fda4af" />
      </linearGradient>
      <radialGradient id="bump" cx="50%" cy="30%" r="50%">
        <stop offset="0%" stopColor="#fde047" />
        <stop offset="100%" stopColor="#eab308" />
      </radialGradient>
      <filter id="moleShadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="3" dy="5" stdDeviation="4" floodOpacity="0.4"/>
      </filter>
    </defs>
    
    {/* Body */}
    <ellipse cx="140" cy="110" rx="80" ry="55" fill="url(#moleBody)" filter="url(#moleShadow)" />
    
    {/* Bumps/Spots */}
    <circle cx="100" cy="85" r="8" fill="url(#bump)" />
    <circle cx="130" cy="75" r="6" fill="url(#bump)" />
    <circle cx="165" cy="80" r="7" fill="url(#bump)" />
    <circle cx="190" cy="95" r="5" fill="url(#bump)" />
    <circle cx="115" cy="100" r="5" fill="url(#bump)" />
    
    {/* Head */}
    <ellipse cx="70" cy="90" rx="40" ry="35" fill="url(#moleBody)" />
    
    {/* Snout */}
    <ellipse cx="40" cy="100" rx="25" ry="18" fill="url(#moleSnout)" />
    
    {/* Nostrils */}
    <ellipse cx="30" cy="98" rx="4" ry="3" fill="#9d174d" />
    <ellipse cx="42" cy="98" rx="4" ry="3" fill="#9d174d" />
    
    {/* Eyes */}
    <circle cx="55" cy="80" r="8" fill="#dc2626" />
    <circle cx="54" cy="78" r="3" fill="#fca5a5" />
    <circle cx="80" cy="75" r="8" fill="#dc2626" />
    <circle cx="79" cy="73" r="3" fill="#fca5a5" />
    
    {/* Teeth */}
    <rect x="35" y="112" width="6" height="10" rx="1" fill="white" />
    <rect x="44" y="112" width="5" height="8" rx="1" fill="white" />
    
    {/* Front Left Paw */}
    <ellipse cx="80" cy="155" rx="18" ry="12" fill="url(#moleBelly)" />
    <ellipse cx="70" cy="162" rx="4" ry="8" fill="#374151" />
    <ellipse cx="78" cy="164" rx="4" ry="8" fill="#374151" />
    <ellipse cx="86" cy="162" rx="4" ry="8" fill="#374151" />
    
    {/* Front Right Paw */}
    <ellipse cx="170" cy="155" rx="18" ry="12" fill="url(#moleBelly)" />
    <ellipse cx="162" cy="162" rx="4" ry="8" fill="#374151" />
    <ellipse cx="170" cy="164" rx="4" ry="8" fill="#374151" />
    <ellipse cx="178" cy="162" rx="4" ry="8" fill="#374151" />
    
    {/* Tail */}
    <ellipse cx="225" cy="105" rx="20" ry="8" fill="url(#moleBelly)" transform="rotate(-15, 225, 105)" />
  </svg>
)

const MultipleChoiceQuiz = () => {
  const navigate = useNavigate()
  const location = useLocation()
  
  // Get quiz data from navigation state or use sample data
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

  // Timer effect
  useEffect(() => {
    if (isQuizComplete) return

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          // Auto-advance to next question when time runs out
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

  // Reset timer when question changes
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
      // Quiz complete - navigate to results
      handleSubmitQuiz()
    }
  }

  const handleSubmitQuiz = useCallback(() => {
    // Calculate score
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

    // Navigate to results page
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
    <div className="min-h-screen relative overflow-hidden">
      {/* Custom Quiz Header - replaces standard Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-8 py-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <a 
            href="/home" 
            className="text-2xl font-display font-bold tracking-wider text-white
                       hover:text-hive-purple-light transition-colors duration-300
                       italic"
          >
            TestHive
          </a>

          {/* Quiz Type Title - Center */}
          <h2 className="text-xl font-display font-medium text-white tracking-wide">
            Multiple choices
          </h2>
          
          {/* Leave Quiz Button - Right */}
          <button
            onClick={handleLeaveQuiz}
            className="px-6 py-2.5 border border-hive-purple/40 text-white/90 rounded-lg 
                       hover:bg-hive-purple/15 hover:border-hive-purple-light/60 transition-all duration-300
                       uppercase tracking-widest text-xs font-semibold backdrop-blur-sm"
          >
            Leave THE QUIZ
          </button>
        </div>
      </nav>

      {/* Ambient background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-hive-purple/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-hive-blue/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-hive-pink/5 rounded-full blur-2xl transform -translate-x-1/2 -translate-y-1/2" />
      </div>

      {/* Timer and Progress Section */}
      <div className="relative z-10 px-8 pt-24 pb-6 flex items-center justify-between max-w-6xl mx-auto">
        <div className="flex-1 mr-12">
          <p className="text-white/80 text-sm mb-2.5 font-medium tracking-wide font-body">Time Remaining</p>
          <div className="h-3.5 bg-dark-600/60 rounded-full overflow-hidden backdrop-blur-sm border border-white/5">
            <div
              className="h-full rounded-full transition-all duration-1000 ease-linear relative overflow-hidden"
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

      {/* Main Content Area */}
      <div className="relative z-10 flex flex-col items-center px-8 pt-4 pb-8">
        
        {/* Question Card */}
        <div className="relative w-full max-w-2xl mb-6">
          <div className="absolute inset-0 bg-hive-blue/20 rounded-2xl blur-xl transform scale-105" />
          <div className="relative bg-gradient-to-br from-dark-600/90 to-dark-700/90 backdrop-blur-md 
                          border border-hive-blue/30 rounded-2xl p-8 shadow-2xl">
            <p className="text-white text-xl text-center leading-relaxed font-medium font-body">
              {currentQuestion.questionText}
            </p>
          </div>
        </div>

        {/* Mascot Characters and Navigation Row */}
        <div className="w-full max-w-6xl flex justify-between items-end mb-6">
          {/* Left Mascot - Bird Character */}
          <div className="w-56 h-56 flex items-end justify-center transform hover:scale-105 transition-transform duration-500">
            <BirdMascot />
          </div>

          {/* Center Navigation */}
          <div className="flex items-center gap-8 pb-8">
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

          {/* Right Mascot - Mole/Creature Character */}
          <div className="w-64 h-48 flex items-end justify-center transform hover:scale-105 transition-transform duration-500">
            <MoleMascot />
          </div>
        </div>

        {/* Answer Options */}
        <div className="w-full max-w-5xl grid grid-cols-2 md:grid-cols-4 gap-4">
          {currentQuestion.options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleAnswerSelect(index)}
              className={`relative py-6 px-8 rounded-xl text-2xl font-bold transition-all duration-300 
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
              {/* Hover glow effect */}
              <div className={`absolute inset-0 bg-gradient-to-r from-hive-purple/0 via-hive-purple/10 to-hive-purple/0 
                              opacity-0 group-hover:opacity-100 transition-opacity duration-300
                              ${selectedAnswers[currentQuestionIndex] === index ? 'opacity-100' : ''}`} />
              
              {/* Top highlight */}
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
              
              <span className="relative z-10">{option.text}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Leave Quiz Confirmation Modal */}
      {showLeaveConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="relative bg-gradient-to-br from-dark-600 to-dark-800 border border-hive-purple/30 
                          rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl shadow-hive-purple/20">
            {/* Glow effect */}
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