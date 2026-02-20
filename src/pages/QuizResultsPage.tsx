import { useLocation, useNavigate } from 'react-router-dom'
import { useRouteFade } from '../components/layout/RouteFadeProvider'
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
  const { fadeTo } = useRouteFade()

  const results: QuizResults | null = location.state?.results

  // If no results, redirect to home
  if (!results) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-white/60 text-lg mb-4 font-body">No quiz results found</p>
          <button
            onClick={() => fadeTo('/home')}
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
                <div className="relative w-32 h-32 mb-4">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="rgba(139,92,246,0.2)"
                      strokeWidth="3"
                    />
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#8B5CF6"
                      strokeWidth="3"
                      strokeDasharray={`${score}, 100`}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-bold text-white font-display">{score}%</span>
                  </div>
                </div>
                <p className="text-white/60 text-sm font-body">Overall Score</p>
              </div>

              {/* Stats */}
              <div className="md:col-span-2 grid grid-cols-2 gap-4">
                <div className="bg-dark-500/50 rounded-2xl p-5 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white font-display">{correctAnswers}</p>
                    <p className="text-white/50 text-sm font-body">Correct</p>
                  </div>
                </div>
                <div className="bg-dark-500/50 rounded-2xl p-5 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
                    <XCircle className="w-5 h-5 text-red-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white font-display">{totalQuestions - correctAnswers}</p>
                    <p className="text-white/50 text-sm font-body">Incorrect</p>
                  </div>
                </div>
                <div className="bg-dark-500/50 rounded-2xl p-5 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                    <Target className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white font-display">{totalQuestions}</p>
                    <p className="text-white/50 text-sm font-body">Total Questions</p>
                  </div>
                </div>
                <div className="bg-dark-500/50 rounded-2xl p-5 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-hive-purple/20 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-hive-purple-light" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white font-display">{score}%</p>
                    <p className="text-white/50 text-sm font-body">Accuracy</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Answer Review */}
          <div className="bg-dark-600/80 backdrop-blur-xl rounded-3xl border border-white/5 p-8 mb-8">
            <h2 className="text-xl font-bold text-white mb-6 font-display">Answer Review</h2>
            <div className="space-y-4">
              {quizData.questions.map((question, index) => {
                const userAnswerIndex = answers[index]
                const userAnswer = userAnswerIndex !== null ? question.options[userAnswerIndex] : null
                const correctOption = question.options.find(o => o.isCorrect)
                const isCorrect = userAnswer?.isCorrect ?? false

                return (
                  <div
                    key={index}
                    className={`flex items-start gap-4 p-4 rounded-2xl border ${
                      isCorrect ? 'border-green-500/20 bg-green-500/5' : 'border-red-500/20 bg-red-500/5'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center ${
                      isCorrect ? 'bg-green-500/20' : 'bg-red-500/20'
                    }`}>
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
                          Your answer:{' '}
                          <span className={userAnswer?.isCorrect ? 'text-green-400' : 'text-red-400'}>
                            {userAnswer?.text || 'No answer'}
                          </span>
                        </span>
                        {!isCorrect && (
                          <span className="text-white/50">
                            Correct answer:{' '}
                            <span className="text-green-400">{correctOption?.text}</span>
                          </span>
                        )}
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
              onClick={() => fadeTo('/home')}
              className="flex items-center gap-2 px-8 py-4 bg-dark-500/80 text-white rounded-xl
                         hover:bg-dark-500 transition-all duration-300 border border-white/10 font-body"
            >
              <Home className="w-5 h-5" />
              Back to Home
            </button>
            <button
              onClick={() => fadeTo('/quiz/create')}
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