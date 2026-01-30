import { useLocation, useNavigate } from 'react-router-dom'
import { CheckCircle, XCircle, Clock, Target, Trophy, Home, RotateCcw } from 'lucide-react'
import Navbar from '../components/layout/Navbar'

interface QuizResults {
  totalQuestions: number
  correctAnswers: number
  score: number
  answers: (number | null)[]
  quizData: {
    title: string
    questions: {
      questionText: string
      options: { text: string; isCorrect: boolean }[]
    }[]
  }
}

const QuizResultsPage = () => {
  const location = useLocation()
  const navigate = useNavigate()
  
  const results: QuizResults | null = location.state?.results

  // If no results, redirect to home
  if (!results) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-white/60 text-lg mb-4 font-body">No quiz results found</p>
          <button
            onClick={() => navigate('/home')}
            className="px-6 py-3 bg-hive-purple text-white rounded-xl hover:bg-hive-purple-light transition-colors font-body"
          >
            Go to Home
          </button>
        </div>
      </div>
    )
  }

  const { totalQuestions, correctAnswers, score, answers, quizData } = results

  // Determine performance level
  const getPerformanceLevel = (score: number) => {
    if (score >= 90) return { label: 'Excellent!', color: 'text-green-400', bg: 'bg-green-500/20' }
    if (score >= 70) return { label: 'Great Job!', color: 'text-blue-400', bg: 'bg-blue-500/20' }
    if (score >= 50) return { label: 'Good Effort!', color: 'text-yellow-400', bg: 'bg-yellow-500/20' }
    return { label: 'Keep Practicing!', color: 'text-orange-400', bg: 'bg-orange-500/20' }
  }

  const performance = getPerformanceLevel(score)

  return (
    <div className="min-h-screen">
      <Navbar />
      
      {/* Ambient background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-hive-purple/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-hive-blue/10 rounded-full blur-3xl" />
      </div>

      {/* Main Content */}
      <main className="relative z-10 pt-24 pb-12 px-8">
        <div className="max-w-4xl mx-auto">
          
          {/* Results Header */}
          <div className="text-center mb-12">
            <div className={`inline-flex items-center gap-2 px-6 py-2 rounded-full ${performance.bg} mb-6`}>
              <Trophy className={`w-5 h-5 ${performance.color}`} />
              <span className={`font-semibold font-body ${performance.color}`}>{performance.label}</span>
            </div>
            <h1 className="text-4xl font-bold text-white mb-3 font-display">Quiz Complete!</h1>
            <p className="text-white/60 font-body">{quizData.title}</p>
          </div>

          {/* Score Card */}
          <div className="bg-dark-600/80 backdrop-blur-xl rounded-3xl border border-hive-purple/20 p-8 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              
              {/* Score Circle */}
              <div className="flex flex-col items-center justify-center">
                <div className="relative w-40 h-40">
                  {/* Background circle */}
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="80"
                      cy="80"
                      r="70"
                      fill="none"
                      stroke="rgba(147, 51, 234, 0.2)"
                      strokeWidth="12"
                    />
                    {/* Progress circle */}
                    <circle
                      cx="80"
                      cy="80"
                      r="70"
                      fill="none"
                      stroke="url(#scoreGradient)"
                      strokeWidth="12"
                      strokeLinecap="round"
                      strokeDasharray={`${(score / 100) * 440} 440`}
                      className="transition-all duration-1000 ease-out"
                    />
                    <defs>
                      <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#9333EA" />
                        <stop offset="100%" stopColor="#EC4899" />
                      </linearGradient>
                    </defs>
                  </svg>
                  {/* Score text */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-4xl font-bold text-white font-display">{score}%</span>
                    <span className="text-white/50 text-sm font-body">Score</span>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="md:col-span-2 grid grid-cols-2 gap-6">
                {/* Correct Answers */}
                <div className="bg-dark-500/50 rounded-2xl p-6 border border-green-500/20">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-green-500/20 rounded-lg">
                      <CheckCircle className="w-5 h-5 text-green-400" />
                    </div>
                    <span className="text-white/60 text-sm font-body">Correct</span>
                  </div>
                  <p className="text-3xl font-bold text-white font-display">{correctAnswers}</p>
                </div>

                {/* Wrong Answers */}
                <div className="bg-dark-500/50 rounded-2xl p-6 border border-red-500/20">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-red-500/20 rounded-lg">
                      <XCircle className="w-5 h-5 text-red-400" />
                    </div>
                    <span className="text-white/60 text-sm font-body">Incorrect</span>
                  </div>
                  <p className="text-3xl font-bold text-white font-display">{totalQuestions - correctAnswers}</p>
                </div>

                {/* Total Questions */}
                <div className="bg-dark-500/50 rounded-2xl p-6 border border-hive-blue/20">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-hive-blue/20 rounded-lg">
                      <Target className="w-5 h-5 text-hive-blue" />
                    </div>
                    <span className="text-white/60 text-sm font-body">Total Questions</span>
                  </div>
                  <p className="text-3xl font-bold text-white font-display">{totalQuestions}</p>
                </div>

                {/* Accuracy */}
                <div className="bg-dark-500/50 rounded-2xl p-6 border border-hive-purple/20">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-hive-purple/20 rounded-lg">
                      <Clock className="w-5 h-5 text-hive-purple-light" />
                    </div>
                    <span className="text-white/60 text-sm font-body">Accuracy</span>
                  </div>
                  <p className="text-3xl font-bold text-white font-display">
                    {Math.round((correctAnswers / totalQuestions) * 100)}%
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Question Review */}
          <div className="bg-dark-600/80 backdrop-blur-xl rounded-3xl border border-hive-purple/20 p-8 mb-8">
            <h2 className="text-xl font-bold text-white mb-6 font-display">Question Review</h2>
            
            <div className="space-y-4">
              {quizData.questions.map((question, index) => {
                const userAnswerIndex = answers[index]
                const userAnswer = userAnswerIndex !== null ? question.options[userAnswerIndex] : null
                const correctOption = question.options.find(opt => opt.isCorrect)
                const isCorrect = userAnswer?.isCorrect || false

                return (
                  <div 
                    key={index}
                    className={`p-5 rounded-xl border ${
                      isCorrect 
                        ? 'bg-green-500/5 border-green-500/20' 
                        : 'bg-red-500/5 border-red-500/20'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`p-1.5 rounded-full ${isCorrect ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                        {isCorrect ? (
                          <CheckCircle className="w-4 h-4 text-green-400" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-400" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-white/90 font-medium mb-2">
                          {index + 1}. {question.questionText}
                        </p>
                        <div className="flex flex-wrap gap-4 text-sm">
                          <span className="text-white/50">
                            Your answer: {' '}
                            <span className={userAnswer?.isCorrect ? 'text-green-400' : 'text-red-400'}>
                              {userAnswer?.text || 'No answer'}
                            </span>
                          </span>
                          {!isCorrect && (
                            <span className="text-white/50">
                              Correct answer: {' '}
                              <span className="text-green-400">{correctOption?.text}</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center gap-4">
            <button
              onClick={() => navigate('/home')}
              className="flex items-center gap-2 px-8 py-4 bg-dark-500/80 text-white rounded-xl
                         hover:bg-dark-500 transition-all duration-300 border border-white/10 font-body"
            >
              <Home className="w-5 h-5" />
              Back to Home
            </button>
            <button
              onClick={() => navigate('/ai-generate')}
              className="flex items-center gap-2 px-8 py-4 bg-hive-purple text-white rounded-xl
                         hover:bg-hive-purple-light transition-all duration-300 font-body"
            >
              <RotateCcw className="w-5 h-5" />
              Create New Quiz
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}

export default QuizResultsPage