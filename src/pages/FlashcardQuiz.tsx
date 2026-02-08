import { useState, useCallback, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { ChevronLeft, ChevronRight, RotateCcw, Home, Layers } from 'lucide-react'

// Types
interface Flashcard {
  id: string
  front: string
  back: string
  deckName: string
}

interface FlashcardQuizData {
  title: string
  cards: Flashcard[]
  deckName: string
}

// Sample flashcard data
const sampleFlashcardData: FlashcardQuizData = {
  title: "HTTP Status Codes Flashcards",
  deckName: "HTTP Status Codes",
  cards: [
    { id: '1', front: 'What does HTTP status code 200 mean?', back: 'OK - The request succeeded', deckName: 'HTTP Status Codes' },
    { id: '2', front: 'What does HTTP status code 201 mean?', back: 'Created - A new resource was successfully created', deckName: 'HTTP Status Codes' },
    { id: '3', front: 'What does HTTP status code 204 mean?', back: 'No Content - Success but no content to return', deckName: 'HTTP Status Codes' },
    { id: '4', front: 'What does HTTP status code 301 mean?', back: 'Moved Permanently - Resource has moved to a new URL', deckName: 'HTTP Status Codes' },
    { id: '5', front: 'What does HTTP status code 302 mean?', back: 'Found - Temporary redirect to another URL', deckName: 'HTTP Status Codes' },
    { id: '6', front: 'What does HTTP status code 400 mean?', back: 'Bad Request - Server cannot process due to client error', deckName: 'HTTP Status Codes' },
    { id: '7', front: 'What does HTTP status code 401 mean?', back: 'Unauthorized - Authentication is required', deckName: 'HTTP Status Codes' },
    { id: '8', front: 'What does HTTP status code 403 mean?', back: 'Forbidden - Server refuses to authorize the request', deckName: 'HTTP Status Codes' },
    { id: '9', front: 'What does HTTP status code 404 mean?', back: 'Not Found - The requested resource does not exist', deckName: 'HTTP Status Codes' },
    { id: '10', front: 'What does HTTP status code 500 mean?', back: 'Internal Server Error - Unexpected server condition', deckName: 'HTTP Status Codes' },
  ]
}

const FlashcardQuiz = () => {
  const navigate = useNavigate()
  const location = useLocation()
  
  // Get quiz data from navigation state or use sample data
  const quizData: FlashcardQuizData = location.state?.quizData || sampleFlashcardData
  const totalCards = quizData.cards.length

  // State
  const [currentCardIndex, setCurrentCardIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false)
  const [viewedCards, setViewedCards] = useState<Set<number>>(new Set([0]))
  const [isAnimating, setIsAnimating] = useState(false)

  const currentCard = quizData.cards[currentCardIndex]

  // Handle card flip
  const handleFlip = useCallback(() => {
    if (isAnimating) return
    setIsAnimating(true)
    setIsFlipped(prev => !prev)
    setTimeout(() => setIsAnimating(false), 600)
  }, [isAnimating])

  // Navigate to previous card
  const handlePrevious = useCallback(() => {
    if (currentCardIndex > 0) {
      setIsFlipped(false)
      setTimeout(() => {
        setCurrentCardIndex(prev => prev - 1)
      }, 150)
    }
  }, [currentCardIndex])

  // Navigate to next card
  const handleNext = useCallback(() => {
    if (currentCardIndex < totalCards - 1) {
      setIsFlipped(false)
      setViewedCards(prev => new Set([...prev, currentCardIndex + 1]))
      setTimeout(() => {
        setCurrentCardIndex(prev => prev + 1)
      }, 150)
    }
  }, [currentCardIndex, totalCards])

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault()
        handleFlip()
      } else if (e.key === 'ArrowLeft') {
        handlePrevious()
      } else if (e.key === 'ArrowRight') {
        handleNext()
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [handleFlip, handlePrevious, handleNext])

  // Handle finishing the deck
  const handleFinishDeck = () => {
    navigate('/home')
  }

  // Handle restart deck
  const handleRestartDeck = () => {
    setCurrentCardIndex(0)
    setIsFlipped(false)
    setViewedCards(new Set([0]))
  }

  // Leave deck handlers
  const handleLeaveDeck = () => {
    setShowLeaveConfirm(true)
  }

  const confirmLeaveDeck = () => {
    navigate('/home')
  }

  // Progress calculation
  const progressPercentage = ((currentCardIndex + 1) / totalCards) * 100

  return (
    <div className="min-h-screen w-full relative overflow-hidden">
      {/* Ambient background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-hive-purple/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-hive-blue/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-hive-pink/5 rounded-full blur-3xl" />
      </div>

      {/* Main Content */}
      <div className="relative z-20 min-h-screen flex flex-col">
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
            <div className="flex items-center gap-3">
              <Layers className="w-5 h-5 text-hive-purple-light" />
              <h2 className="text-xl font-display font-medium text-white tracking-wide">
                {quizData.deckName}
              </h2>
            </div>
            <button
              onClick={handleLeaveDeck}
              className="px-6 py-2.5 border border-hive-purple/40 text-white/90 rounded-lg 
                         hover:bg-hive-purple/15 hover:border-hive-purple-light/60 transition-all duration-300
                         uppercase tracking-widest text-xs font-semibold backdrop-blur-sm"
            >
              Leave Deck
            </button>
          </div>
        </nav>

        {/* Progress Section */}
        <div className="flex-shrink-0 px-8 py-4">
          <div className="max-w-2xl mx-auto">
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center gap-4">
                <span className="text-white/70 text-sm font-medium tracking-wide font-body">Progress</span>
                <span className="text-hive-purple-light font-bold text-sm font-display">
                  {viewedCards.size} of {totalCards} viewed
                </span>
              </div>
              <div className="text-right">
                <p className="text-white text-2xl font-bold font-display">
                  <span className="text-hive-purple-light">{currentCardIndex + 1}</span>
                  <span className="text-white/40 mx-1">/</span>
                  <span>{totalCards}</span>
                </p>
              </div>
            </div>
            {/* Progress Bar */}
            <div className="h-2 bg-dark-600/50 rounded-full overflow-hidden backdrop-blur-sm border border-white/5">
              <div 
                className="h-full rounded-full transition-all duration-500 ease-out relative"
                style={{ 
                  width: `${progressPercentage}%`,
                  background: 'linear-gradient(90deg, #9333EA, #A855F7, #C084FC)'
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-transparent to-white/20" />
              </div>
            </div>
          </div>
        </div>

        {/* Main Card Area */}
        <div className="flex-1 flex items-center justify-center px-8 py-8">
          <div 
            className="relative w-full max-w-2xl cursor-pointer"
            onClick={handleFlip}
            style={{ perspective: '1000px' }}
          >
            {/* Card Container with 3D flip */}
            <div 
              className="relative w-full"
              style={{
                transformStyle: 'preserve-3d',
                transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
            >
              {/* Front Side (Question) */}
              <div 
                className="relative w-full"
                style={{ backfaceVisibility: 'hidden' }}
              >
                {/* Card glow effect */}
                <div className="absolute inset-0 bg-hive-purple/20 rounded-3xl blur-xl transform scale-105" />
                
                {/* Card content */}
                <div className="relative bg-gradient-to-br from-dark-600/95 to-dark-700/95 backdrop-blur-md 
                                border border-hive-purple/30 rounded-3xl p-10 shadow-2xl min-h-[320px]
                                flex flex-col items-center justify-center">
                  {/* Question Label */}
                  <div className="absolute top-4 left-6 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-hive-purple animate-pulse" />
                    <span className="text-hive-purple-light/80 text-xs font-medium uppercase tracking-wider font-body">
                      Question
                    </span>
                  </div>

                  {/* Question Text */}
                  <p className="text-white text-xl md:text-2xl text-center leading-relaxed font-medium font-body px-4">
                    {currentCard.front}
                  </p>

                  {/* Click to reveal hint */}
                  <div className="absolute bottom-6 left-0 right-0 flex justify-center">
                    <div className="flex items-center gap-2 px-4 py-2 bg-hive-purple/20 rounded-full 
                                    border border-hive-purple/30 backdrop-blur-sm">
                      <span className="text-white/60 text-sm font-body">Click to reveal answer</span>
                      <svg className="w-4 h-4 text-hive-purple-light animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Back Side (Answer) */}
              <div 
                className="absolute inset-0 w-full"
                style={{ 
                  backfaceVisibility: 'hidden',
                  transform: 'rotateY(180deg)'
                }}
              >
                {/* Card glow effect - different color for answer */}
                <div className="absolute inset-0 bg-hive-blue/20 rounded-3xl blur-xl transform scale-105" />
                
                {/* Card content */}
                <div className="relative bg-gradient-to-br from-dark-600/95 to-dark-700/95 backdrop-blur-md 
                                border border-hive-blue/30 rounded-3xl p-10 shadow-2xl min-h-[320px]
                                flex flex-col items-center justify-center">
                  {/* Answer Label */}
                  <div className="absolute top-4 left-6 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-hive-blue animate-pulse" />
                    <span className="text-hive-blue/80 text-xs font-medium uppercase tracking-wider font-body">
                      Answer
                    </span>
                  </div>

                  {/* Answer Text */}
                  <p className="text-white text-xl md:text-2xl text-center leading-relaxed font-medium font-body px-4">
                    {currentCard.back}
                  </p>

                  {/* Click to flip back hint */}
                  <div className="absolute bottom-6 left-0 right-0 flex justify-center">
                    <div className="flex items-center gap-2 px-4 py-2 bg-hive-blue/20 rounded-full 
                                    border border-hive-blue/30 backdrop-blur-sm">
                      <span className="text-white/60 text-sm font-body">Click to flip back</span>
                      <svg className="w-4 h-4 text-hive-blue rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex-shrink-0 flex items-center justify-center gap-6 py-6 px-8">
          <button
            onClick={handlePrevious}
            disabled={currentCardIndex === 0}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all duration-300 font-body
                       ${currentCardIndex === 0 
                         ? 'bg-dark-600/30 text-white/30 cursor-not-allowed' 
                         : 'bg-dark-600/50 text-white/90 hover:bg-dark-500/50 border border-white/10 hover:border-hive-purple/30'}`}
          >
            <ChevronLeft size={20} />
            <span className="text-sm font-medium">Previous</span>
          </button>
          
          {/* Restart Button */}
          <button
            onClick={handleRestartDeck}
            className="flex items-center gap-2 px-5 py-3 bg-dark-600/50 text-white/70 rounded-xl 
                       hover:bg-dark-500/50 hover:text-white transition-all duration-300 border border-white/10
                       hover:border-hive-purple/30 font-body"
          >
            <RotateCcw size={18} />
            <span className="text-sm font-medium">Restart</span>
          </button>

          <button
            onClick={currentCardIndex === totalCards - 1 ? handleFinishDeck : handleNext}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all duration-300 font-body
                       ${currentCardIndex === totalCards - 1 
                         ? 'bg-gradient-to-r from-hive-purple to-hive-purple-light text-white shadow-lg shadow-hive-purple/25 hover:shadow-hive-purple/40' 
                         : 'bg-dark-600/50 text-white/90 hover:bg-dark-500/50 border border-white/10 hover:border-hive-purple/30'}`}
          >
            <span className="text-sm font-medium">
              {currentCardIndex === totalCards - 1 ? 'Finish' : 'Next'}
            </span>
            {currentCardIndex === totalCards - 1 ? (
              <Home size={18} />
            ) : (
              <ChevronRight size={20} />
            )}
          </button>
        </div>

        {/* Keyboard shortcut hint */}
        <div className="flex-shrink-0 pb-6">
          <p className="text-center text-white/30 text-xs font-body">
            Press <kbd className="px-2 py-0.5 bg-dark-600/50 rounded border border-white/10 mx-1">Space</kbd> 
            to flip • 
            <kbd className="px-2 py-0.5 bg-dark-600/50 rounded border border-white/10 mx-1">←</kbd>
            <kbd className="px-2 py-0.5 bg-dark-600/50 rounded border border-white/10 mx-1">→</kbd> 
            to navigate
          </p>
        </div>
      </div>

      {/* Leave Deck Confirmation Modal */}
      {showLeaveConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="relative bg-gradient-to-br from-dark-600 to-dark-800 border border-hive-purple/30 
                          rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl shadow-hive-purple/20">
            {/* Modal glow */}
            <div className="absolute inset-0 bg-hive-purple/5 rounded-2xl blur-xl" />
            
            <div className="relative">
              <h3 className="text-2xl font-bold text-white mb-4 font-display">Leave Deck?</h3>
              <p className="text-white/70 mb-8 leading-relaxed font-body">
                Are you sure you want to leave this flashcard deck? Your progress through the deck will not be saved.
              </p>
              
              <div className="flex gap-4">
                <button
                  onClick={() => setShowLeaveConfirm(false)}
                  className="flex-1 py-3 px-6 bg-dark-500/80 text-white rounded-xl 
                             hover:bg-dark-500 transition-all duration-300 border border-white/10 font-body font-medium"
                >
                  Stay
                </button>
                <button
                  onClick={confirmLeaveDeck}
                  className="flex-1 py-3 px-6 bg-red-500/80 text-white rounded-xl 
                             hover:bg-red-500 transition-all duration-300 font-body font-medium"
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

export default FlashcardQuiz