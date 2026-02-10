import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'

const LoginPage = () => {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [focusedField, setFocusedField] = useState<string | null>(null)

  // Generate static star positions on mount
  const [stars] = useState(() => 
    [...Array(150)].map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      delay: Math.random() * 4,
      duration: 2 + Math.random() * 3,
      size: i % 5 === 0 ? 1 : i % 3 === 0 ? 3 : 2,
    }))
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    const result = await login(email, password)

    if (result.success) {
      navigate('/home')
    } else {
      setError(result.error || 'Login failed')
    }

    setIsLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden px-4">
      {/* Deep space background gradient */}
      <div className="fixed inset-0 bg-gradient-to-b from-[#0a0a1a] via-[#0d1025] to-[#0a0a12]" />

      {/* Animated stars background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {stars.map((star) => (
          <div
            key={star.id}
            className="absolute rounded-full bg-white animate-twinkle"
            style={{
              left: `${star.left}%`,
              top: `${star.top}%`,
              width: `${star.size}px`,
              height: `${star.size}px`,
              animationDelay: `${star.delay}s`,
              animationDuration: `${star.duration}s`,
            }}
          />
        ))}
      </div>

      {/* Shooting stars */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="shooting-star"
            style={{
              top: `${10 + i * 15}%`,
              left: `${20 + i * 25}%`,
              animationDelay: `${i * 3}s`,
            }}
          />
        ))}
      </div>

      {/* Blue nebula glow - top */}
      <div className="fixed top-[-20%] left-[20%] w-[800px] h-[600px] rounded-full bg-blue-500/8 blur-[150px] pointer-events-none" />
      
      {/* Secondary blue glow - top right */}
      <div className="fixed top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-cyan-500/6 blur-[120px] pointer-events-none" />
      
      {/* Subtle purple accent - bottom */}
      <div className="fixed bottom-[-20%] left-[-10%] w-[600px] h-[400px] rounded-full bg-purple-500/5 blur-[130px] pointer-events-none" />

      {/* Floating particles */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="floating-particle"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 10}s`,
              animationDuration: `${15 + Math.random() * 20}s`,
            }}
          />
        ))}
      </div>

      {/* Login Card */}
      <div 
        className="relative z-10 w-full max-w-md animate-card-entrance"
      >
        {/* Card glow effect */}
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-blue-500/20 rounded-3xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity duration-500" />
        
        <div className="relative bg-[#12121f]/90 backdrop-blur-2xl rounded-2xl p-8 md:p-10 border border-white/10 shadow-2xl shadow-black/50">
          {/* Animated border gradient */}
          <div className="absolute inset-0 rounded-2xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500/10 to-transparent animate-border-flow" />
          </div>

          {/* Header with animated text */}
          <div className="relative">
            <h1 className="text-3xl md:text-4xl font-display font-bold text-white text-center mb-2 animate-text-glow">
              Welcome Back!
            </h1>
            <div className="h-1 w-16 mx-auto bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mb-8" />
          </div>

          {/* Error Message */}
          {error && (
            <div className="relative mb-6 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
              <p className="text-red-400 text-sm text-center">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6 relative">
            {/* Email Field */}
            <div className="space-y-2">
              <label className="text-white/80 text-sm font-medium flex items-center gap-2">
                <span className={`transition-colors duration-300 ${focusedField === 'email' ? 'text-blue-400' : ''}`}>
                  Email
                </span>
              </label>
              <div className={`relative group transition-all duration-300 ${focusedField === 'email' ? 'scale-[1.02]' : ''}`}>
                <div className={`absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg blur opacity-0 transition-opacity duration-300 ${focusedField === 'email' ? 'opacity-50' : 'group-hover:opacity-30'}`} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                  placeholder="Enter your email"
                  className="relative w-full px-4 py-3.5 bg-[#1a1a2e]/80 border-2 border-purple-500/50 rounded-lg
                           text-white placeholder-white/30 outline-none
                           focus:border-purple-500 focus:bg-[#1a1a2e]
                           transition-all duration-300"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-white/80 text-sm font-medium">
                  <span className={`transition-colors duration-300 ${focusedField === 'password' ? 'text-blue-400' : ''}`}>
                    Password
                  </span>
                </label>
                <button
                  type="button"
                  className="text-white/50 text-sm hover:text-blue-400 transition-colors duration-300"
                >
                  
                </button>
              </div>
              <div className={`relative group transition-all duration-300 ${focusedField === 'password' ? 'scale-[1.02]' : ''}`}>
                <div className={`absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg blur opacity-0 transition-opacity duration-300 ${focusedField === 'password' ? 'opacity-50' : 'group-hover:opacity-30'}`} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                  placeholder="Enter your password"
                  className="relative w-full px-4 py-3.5 bg-[#1a1a2e]/80 border border-white/10 rounded-lg
                           text-white placeholder-white/30 outline-none
                           focus:border-blue-500/50 focus:bg-[#1a1a2e]
                           transition-all duration-300 pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-blue-400 transition-all duration-300 hover:scale-110"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="relative w-full py-4 bg-gradient-to-r from-purple-600 to-purple-500 text-white font-semibold rounded-lg
                       overflow-hidden group disabled:opacity-70 disabled:cursor-not-allowed
                       transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/30 hover:scale-[1.02] active:scale-[0.98]"
            >
              {/* Button shine effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
              
              <span className="relative flex items-center justify-center gap-2">
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Logging in...
                  </>
                ) : (
                  'Log In'
                )}
              </span>
            </button>
          </form>

          {/* Sign Up Link */}
          <p className="text-center text-white/50 mt-8">
            Don't Have An Account{' '}
            <Link 
              to="/signup" 
              className="text-white font-medium hover:text-blue-400 transition-colors duration-300 relative group"
            >
              Sign Up
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-400 group-hover:w-full transition-all duration-300" />
            </Link>
          </p>
        </div>
      </div>

      {/* Styles */}
      <style>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.2; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.3); }
        }
        
        .animate-twinkle {
          animation: twinkle 3s ease-in-out infinite;
        }

        .shooting-star {
          position: absolute;
          width: 150px;
          height: 2px;
          background: linear-gradient(90deg, rgba(255,255,255,0.9), rgba(100,180,255,0.5), transparent);
          transform: rotate(45deg);
          animation: shoot 4s ease-out infinite;
          opacity: 0;
          border-radius: 50%;
          box-shadow: 0 0 10px rgba(100,180,255,0.5);
        }

        @keyframes shoot {
          0% {
            opacity: 0;
            transform: translateX(0) translateY(0) rotate(45deg);
          }
          5% {
            opacity: 1;
          }
          15% {
            opacity: 0;
            transform: translateX(400px) translateY(400px) rotate(45deg);
          }
          100% {
            opacity: 0;
            transform: translateX(400px) translateY(400px) rotate(45deg);
          }
        }

        .floating-particle {
          position: absolute;
          width: 3px;
          height: 3px;
          background: rgba(100, 180, 255, 0.4);
          border-radius: 50%;
          bottom: -10px;
          animation: float-up linear infinite;
        }

        @keyframes float-up {
          0% {
            transform: translateY(0) translateX(0);
            opacity: 0;
          }
          10% {
            opacity: 0.6;
          }
          90% {
            opacity: 0.6;
          }
          100% {
            transform: translateY(-100vh) translateX(50px);
            opacity: 0;
          }
        }

        .animate-card-entrance {
          animation: cardEntrance 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        @keyframes cardEntrance {
          from {
            opacity: 0;
            transform: translateY(40px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .animate-text-glow {
          animation: textGlow 3s ease-in-out infinite alternate;
        }

        @keyframes textGlow {
          from {
            text-shadow: 0 0 20px rgba(100, 180, 255, 0.2);
          }
          to {
            text-shadow: 0 0 30px rgba(100, 180, 255, 0.4), 0 0 60px rgba(100, 180, 255, 0.2);
          }
        }

        .animate-border-flow {
          animation: borderFlow 3s linear infinite;
        }

        @keyframes borderFlow {
          from {
            transform: translateX(-100%);
          }
          to {
            transform: translateX(100%);
          }
        }
      `}</style>
    </div>
  )
}

export default LoginPage