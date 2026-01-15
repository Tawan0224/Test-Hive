import { useState, useRef, useCallback } from 'react'
import { Upload, ArrowUp, FileText, X, Loader2 } from 'lucide-react'
import Navbar from '../components/layout/Navbar'
import MascotBird from '../components/three/MascotBird'

// Types
type QuizType = 'multiple-choice' | 'flashcard' | 'matching'
type QuestionCount = 10 | 15 | 25

interface UploadedFile {
  file: File
  name: string
  size: string
}

const AIGeneratePage = () => {
  const [selectedQuizType, setSelectedQuizType] = useState<QuizType>('multiple-choice')
  const [selectedCount, setSelectedCount] = useState<QuestionCount>(10)
  const [prompt, setPrompt] = useState('')
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  
  const fileInputRef = useRef<HTMLInputElement>(null)

  const quizTypes: { value: QuizType; label: string }[] = [
    { value: 'multiple-choice', label: 'Multiple Choices' },
    { value: 'flashcard', label: 'Flashcards' },
    { value: 'matching', label: 'Matching' },
  ]

  const questionCounts: QuestionCount[] = [10, 15, 25]

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  const handleFileSelect = useCallback((file: File) => {
    if (file.type !== 'application/pdf') {
      alert('Please upload a PDF file')
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB')
      return
    }
    setUploadedFile({
      file,
      name: file.name,
      size: formatFileSize(file.size),
    })
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
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleGenerate = async () => {
    if (!uploadedFile) {
      alert('Please upload a PDF file first')
      return
    }

    setIsGenerating(true)
    
    try {
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      console.log('Generating quiz:', {
        type: selectedQuizType,
        count: selectedCount,
        prompt,
        file: uploadedFile.name,
      })
      
      alert('Quiz generation feature coming soon!')
    } catch (error) {
      console.error('Error generating quiz:', error)
      alert('Failed to generate quiz. Please try again.')
    } finally {
      setIsGenerating(false)
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
              {/* Glow effect */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-[400px] h-[400px] rounded-full bg-purple-500/10 blur-[100px]" />
              </div>
              
              {/* 3D Canvas Container */}
              <div className="w-full h-[450px] relative z-10">
                <MascotBird />
              </div>
            </div>

            {/* Right Side - Options Panel */}
            <div className="w-[520px] flex-shrink-0">
              <div className="relative bg-[#1a1a2e]/80 backdrop-blur-xl rounded-3xl border border-purple-500/20 p-10">
                {/* Gradient overlay */}
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
                      Choose the number of questions to generate
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
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Bottom Input Section */}
      <div className="fixed bottom-0 left-0 right-0 z-50 px-8 pb-5 pt-3 bg-gradient-to-t from-[#0a0a12] via-[#0a0a12]/95 to-transparent">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3">
            {/* Text Input */}
            <form onSubmit={handlePromptSubmit} className="flex-1 relative">
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Ask"
                disabled={isGenerating}
                className="w-full py-3.5 pl-5 pr-12 bg-[#1a1a2e]/80 
                         border border-white/10 rounded-full
                         text-white text-sm placeholder-white/30
                         outline-none transition-all duration-200
                         focus:border-purple-500/40
                         disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={isGenerating || !uploadedFile}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 p-2.5 rounded-full
                         bg-[#252538] text-white/60
                         transition-all duration-200
                         hover:bg-purple-600 hover:text-white
                         disabled:opacity-40 disabled:hover:bg-[#252538]"
              >
                {isGenerating ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <ArrowUp className="w-4 h-4" />
                )}
              </button>
            </form>

            {/* File Upload */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`flex-shrink-0 transition-transform duration-150 ${isDragging ? 'scale-105' : ''}`}
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
                  <button
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
          </div>

          {/* Helper text */}
          <p className="mt-3 text-center text-white/30 text-xs">
            Upload a PDF and let AI generate quiz questions for you
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