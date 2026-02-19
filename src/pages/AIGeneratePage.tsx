import { useState, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Upload, ArrowUp, FileText, X, Loader2 } from 'lucide-react'
import Navbar from '../components/layout/Navbar'
import MascotBird from '../components/three/MascotBird'
import { aiAPI } from '../services/api'

// Types
type QuizType = 'multiple-choice' | 'flashcard' | 'matching'
type QuestionCount = 10 | 15 | 20

interface UploadedFile {
  file: File
  name: string
  size: string
}

const AIGeneratePage = () => {
  const navigate = useNavigate()

  const [selectedQuizType, setSelectedQuizType] = useState<QuizType>('multiple-choice')
  const [selectedCount, setSelectedCount] = useState<QuestionCount>(10)
  const [prompt, setPrompt] = useState('')
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [generatingStatus, setGeneratingStatus] = useState('')

  const fileInputRef = useRef<HTMLInputElement>(null)

  const quizTypes: { value: QuizType; label: string }[] = [
    { value: 'multiple-choice', label: 'Multiple Choices' },
    { value: 'flashcard', label: 'Flashcards' },
    { value: 'matching', label: 'Matching' },
  ]

  const questionCounts: QuestionCount[] = [10, 15, 20]

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  const handleFileSelect = useCallback((file: File) => {
    if (file.type !== 'application/pdf') {
      alert('Please upload a PDF file only.')
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB.')
      return
    }
    setUploadedFile({ file, name: file.name, size: formatFileSize(file.size) })
  }, [])

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFileSelect(file)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) handleFileSelect(file)
  }

  const removeFile = () => {
    setUploadedFile(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleGenerate = async () => {
    if (!uploadedFile) {
      alert('Please upload a PDF file first.')
      return
    }

    setIsGenerating(true)
    setGeneratingStatus('Reading your PDF...')

    try {
      // Small delay so the status message is visible
      await new Promise(resolve => setTimeout(resolve, 400))
      setGeneratingStatus('Generating questions with AI...')

      const response = await aiAPI.generateFromPDF({
        file: uploadedFile.file,
        quizType: selectedQuizType,
        count: selectedCount,
        customInstructions: prompt,
        difficulty: 'medium',
      })

      if (!response.success || !response.data) {
        throw new Error(response.error?.message || 'Generation failed.')
      }

      const { quiz, generated } = response.data as any

      setGeneratingStatus('Done! Loading your quiz...')
      await new Promise(resolve => setTimeout(resolve, 300))

      // Navigate to the correct quiz page with real generated data
      if (selectedQuizType === 'multiple-choice') {
        navigate('/quiz/multiple-choice', {
          state: {
            quizData: {
              _id: quiz._id,
              title: generated.title,
              questions: generated.questions,
            },
          },
        })
      } else if (selectedQuizType === 'flashcard') {
        navigate('/quiz/flashcard', {
          state: {
            quizData: {
              _id: quiz._id,
              title: generated.title,
              cards: generated.cards,
              deckName: generated.deckName,
            },
          },
        })
      } else if (selectedQuizType === 'matching') {
        navigate('/quiz/matching', {
          state: {
            quizData: {
              _id: quiz._id,
              title: generated.title,
              pairs: generated.pairs.map((p: any, i: number) => ({
                id: String(i + 1), left: p.left, right: p.right
              })),
              timeLimit: generated.timeLimit || 120,
              points: generated.points || 10,
            },
          },
        })
      }
    } catch (error: any) {
      console.error('Generation error:', error)
      alert(error.message || 'Failed to generate quiz. Please try again.')
    } finally {
      setIsGenerating(false)
      setGeneratingStatus('')
    }
  }

  const handlePromptSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleGenerate()
  }

  return (
    <div className="fixed inset-0 overflow-hidden">
      <Navbar />

      {/* Main Content */}
      <main className="h-full pt-20 pb-28 px-8">
        <div className="max-w-7xl mx-auto h-full">
          <div className="flex items-center justify-between gap-8 h-full">

            {/* Left Side - 3D Mascot */}
            <div className="flex-1 h-full flex items-center justify-center relative">
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-[400px] h-[400px] rounded-full bg-purple-500/10 blur-[100px]" />
              </div>
              <div className="w-full h-[450px] relative z-10">
                <MascotBird />
              </div>
            </div>

            {/* Right Side - Options Panel */}
            <div className="w-[520px] flex-shrink-0">
              <div className="relative bg-[#1a1a2e]/80 backdrop-blur-xl rounded-3xl border border-purple-500/20 p-10">
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-purple-500/10 via-transparent to-blue-500/5 pointer-events-none" />

                <div className="relative space-y-10">
                  {/* Quiz Type Selection */}
                  <div>
                    <h3 className="text-white/90 text-lg font-medium mb-5">
                      Choose the question type you want to generate
                    </h3>
                    <div className="flex gap-3">
                      {quizTypes.map((type) => (
                        <button
                          key={type.value}
                          onClick={() => setSelectedQuizType(type.value)}
                          className={`
                            flex-1 py-4 px-4 rounded-xl text-sm font-medium whitespace-nowrap
                            transition-all duration-200
                            ${selectedQuizType === type.value
                              ? 'bg-purple-600 text-white'
                              : 'bg-[#2a2a40]/80 text-white/60 border border-white/10 hover:bg-[#353550] hover:text-white/80'
                            }
                          `}
                        >
                          {type.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="h-px bg-purple-500/30" />

                  {/* Question Count */}
                  <div>
                    <h3 className="text-white/90 text-lg font-medium mb-5">
                      Choose the number of{' '}
                      {selectedQuizType === 'matching'
                        ? 'pairs'
                        : selectedQuizType === 'flashcard'
                        ? 'cards'
                        : 'questions'}{' '}
                      to generate
                    </h3>
                    <div className="flex gap-3">
                      {questionCounts.map((count) => (
                        <button
                          key={count}
                          onClick={() => setSelectedCount(count)}
                          className={`
                            flex-1 py-4 px-4 rounded-xl text-base font-medium
                            transition-all duration-200
                            ${selectedCount === count
                              ? 'bg-purple-600 text-white'
                              : 'bg-[#2a2a40]/80 text-white/60 border border-white/10 hover:bg-[#353550] hover:text-white/80'
                            }
                          `}
                        >
                          {count}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Generating status indicator */}
                  {isGenerating && generatingStatus && (
                    <div className="flex items-center gap-3 py-3 px-4 bg-purple-500/10 border border-purple-500/20 rounded-xl">
                      <Loader2 className="w-4 h-4 text-purple-400 animate-spin flex-shrink-0" />
                      <span className="text-purple-300 text-sm">{generatingStatus}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Bottom Input Bar - Fixed */}
      <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-[#0a0a1a] via-[#0a0a1a]/95 to-transparent pt-8 pb-6 px-8">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handlePromptSubmit} className="relative">
            <div className="relative flex items-center gap-3 p-2 bg-[#12121f]/90 border border-white/10 rounded-full backdrop-blur-xl">

              {/* PDF Upload Area */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`transition-transform duration-200 ${isDragging ? 'scale-105' : ''}`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,application/pdf"
                  onChange={handleFileInputChange}
                  className="hidden"
                  id="pdf-upload"
                />

                {uploadedFile ? (
                  <div className="flex items-center gap-2 py-2.5 px-4 bg-[#1a1a2e]/80 border border-purple-500/30 rounded-full">
                    <FileText className="w-4 h-4 text-purple-400" />
                    <span className="text-white/80 text-sm max-w-[120px] truncate">
                      {uploadedFile.name}
                    </span>
                    <span className="text-white/40 text-xs">{uploadedFile.size}</span>
                    <button
                      type="button"
                      onClick={removeFile}
                      className="p-0.5 text-white/40 hover:text-red-400 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <label
                    htmlFor="pdf-upload"
                    className={`
                      flex items-center gap-2 py-3.5 px-5
                      bg-[#1a1a2e]/80 border rounded-full cursor-pointer
                      transition-all duration-200
                      ${isDragging
                        ? 'border-purple-500 bg-purple-500/10'
                        : 'border-white/10 hover:border-white/20'
                      }
                    `}
                  >
                    <Upload className={`w-4 h-4 ${isDragging ? 'text-purple-400' : 'text-white/50'}`} />
                    <span className={`text-sm ${isDragging ? 'text-purple-300' : 'text-white/50'}`}>
                      Upload a PDF file
                    </span>
                  </label>
                )}
              </div>

              {/* Text Input */}
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Add custom instructions (optional)..."
                disabled={isGenerating}
                className="flex-1 bg-transparent text-white/90 placeholder:text-white/30
                           outline-none text-sm px-2 disabled:opacity-50"
              />

              {/* Generate Button */}
              <button
                type="submit"
                disabled={isGenerating || !uploadedFile}
                className={`
                  p-3.5 rounded-full transition-all duration-300
                  ${isGenerating || !uploadedFile
                    ? 'bg-white/10 text-white/30 cursor-not-allowed'
                    : 'bg-purple-600 text-white hover:bg-purple-500 hover:scale-105'
                  }
                `}
              >
                {isGenerating ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <ArrowUp className="w-5 h-5" />
                )}
              </button>
            </div>
          </form>

          <p className="mt-3 text-center text-white/30 text-xs">
            Upload a PDF and let AI generate{' '}
            {selectedQuizType === 'matching'
              ? 'matching pairs'
              : selectedQuizType === 'flashcard'
              ? 'flashcards'
              : 'quiz questions'}{' '}
            for you
          </p>
        </div>
      </div>

      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute top-1/4 left-0 w-[500px] h-[500px] rounded-full bg-purple-600/5 blur-[120px]" />
        <div className="absolute bottom-1/4 right-0 w-[400px] h-[400px] rounded-full bg-blue-500/5 blur-[100px]" />
      </div>
    </div>
  )
}

export default AIGeneratePage