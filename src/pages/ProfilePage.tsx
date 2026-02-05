import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/layout/Navbar'

// Sample user data (will be replaced with actual auth data later)
const sampleUser = {
  displayName: 'John Cena',
  username: 'johncena114',
  profilePicture: 'https://i.pravatar.cc/300?img=12', // Placeholder avatar
  lastActive: 'now',
}

// Sample achievements data
const sampleAchievements = [
  {
    id: 1,
    name: 'Combo King',
    icon: '🏆',
    description: 'Complete 10 quizzes in a row',
    unlocked: true,
  },
  {
    id: 2,
    name: 'Quick Thinker',
    icon: '⚡',
    description: 'Complete a quiz in under 2 minutes',
    unlocked: true,
  },
  {
    id: 3,
    name: 'Sharp Shooter',
    icon: '🎯',
    description: 'Score 100% on any quiz',
    unlocked: true,
  },
]

// Sample test history data
const sampleTestHistory = [
  {
    id: 1,
    title: 'Web development MCQ',
    type: 'multiple-choice',
    completedAt: '2025-01-15',
  },
  {
    id: 2,
    title: 'Computer architecture flash card',
    type: 'flashcard',
    completedAt: '2025-01-14',
  },
  {
    id: 3,
    title: 'Cloud Computing Matching',
    type: 'matching',
    completedAt: '2025-01-13',
  },
  {
    id: 4,
    title: 'Micro-economic MCQ',
    type: 'multiple-choice',
    completedAt: '2025-01-12',
  },
]

const ProfilePage = () => {
  const navigate = useNavigate()
  const [user] = useState(sampleUser)
  const [achievements] = useState(sampleAchievements)
  const [testHistory] = useState(sampleTestHistory)

  const handleEditProfile = () => {
    // TODO: Navigate to edit profile page
    console.log('Navigate to edit profile')
    // navigate('/profile/edit')
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <Navbar />
      
      {/* Subtle blue ambient glow effects */}
      <div className="fixed top-[10%] right-[15%] w-[400px] h-[400px] rounded-full bg-blue-600/5 blur-[120px] pointer-events-none" />
      <div className="fixed bottom-[10%] left-[10%] w-[350px] h-[350px] rounded-full bg-indigo-600/5 blur-[100px] pointer-events-none" />
      
      <main className="relative z-10 pt-28 px-8 pb-12">
        <div className="max-w-6xl mx-auto">
          {/* Main Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fade-in">
            
            {/* Left Card - User Profile */}
            <div className="relative">
              {/* Card with gradient border */}
              <div className="relative rounded-2xl p-[1px] bg-gradient-to-br from-blue-500/30 via-indigo-500/20 to-purple-500/30">
                <div className="rounded-2xl bg-gradient-to-br from-[#0d1020] via-[#0a0e1a] to-[#0d1020] p-8 min-h-[500px]">
                  
                  {/* Profile Picture */}
                  <div className="flex justify-center mb-6">
                    <div className="relative">
                      {/* Subtle glow behind avatar */}
                      <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-xl" />
                      
                      {/* Avatar container with gradient border */}
                      <div className="relative w-36 h-36 rounded-full p-[2px] bg-gradient-to-br from-cyan-400/50 via-blue-500/30 to-purple-500/50">
                        <div className="w-full h-full rounded-full overflow-hidden bg-[#0d1020]">
                          <img
                            src={user.profilePicture}
                            alt={user.displayName}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none'
                            }}
                          />
                          {/* Fallback initials */}
                          <div className="absolute inset-0 flex items-center justify-center text-3xl font-bold text-white/60">
                            {user.displayName.split(' ').map(n => n[0]).join('')}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* User Info */}
                  <div className="text-center mb-8">
                    <h2 className="text-3xl font-display font-bold text-white mb-2">
                      {user.displayName}
                    </h2>
                    <p className="text-white/40 text-lg mb-4">
                      @{user.username}
                    </p>
                    <p className="text-white/30 text-sm">
                      last time is {user.lastActive}
                    </p>
                  </div>

                  {/* Edit Profile Button */}
                  <button
                    onClick={handleEditProfile}
                    className="w-full py-4 bg-[#12182a]/90 hover:bg-[#1a2240]
                             border border-white/5 hover:border-blue-500/20
                             rounded-xl text-white/80 font-medium
                             transition-all duration-300"
                  >
                    Edit Profile
                  </button>
                </div>
              </div>
            </div>

            {/* Right Card - Achievements & Test History */}
            <div className="relative">
              {/* Card with gradient border */}
              <div className="relative rounded-2xl p-[1px] bg-gradient-to-br from-blue-500/30 via-indigo-500/20 to-purple-500/30">
                <div className="rounded-2xl bg-gradient-to-br from-[#0d1020] via-[#0a0e1a] to-[#0d1020] p-8 min-h-[500px]">
                  
                  {/* Achievements Section */}
                  <div className="mb-10">
                    <h3 className="text-2xl font-display font-bold text-white mb-6">
                      Your Achievements
                    </h3>
                    
                    <div className="flex justify-start gap-8">
                      {achievements.map((achievement) => (
                        <div
                          key={achievement.id}
                          className="flex flex-col items-center group"
                        >
                          {/* Achievement Icon */}
                          <div className="w-20 h-20 mb-3 flex items-center justify-center
                                        bg-[#12182a]/80 rounded-2xl border border-white/5
                                        group-hover:border-blue-500/20 transition-all duration-300">
                            <span className="text-4xl">{achievement.icon}</span>
                          </div>
                          
                          <p className="text-center text-white/60 text-sm max-w-[80px]">
                            {achievement.name}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Test History Section */}
                  <div>
                    <h3 className="text-2xl font-display font-bold text-white mb-6">
                      Your Test History
                    </h3>
                    
                    <div className="grid grid-cols-2 gap-4">
                      {testHistory.map((test) => (
                        <button
                          key={test.id}
                          onClick={() => {
                            console.log('View test:', test.id)
                          }}
                          className="p-4 bg-[#12182a]/80 hover:bg-[#1a2240]
                                   border border-white/5 hover:border-blue-500/20
                                   rounded-xl text-left
                                   transition-all duration-300"
                        >
                          <p className="text-white/80 font-medium text-sm leading-tight">
                            {test.title}
                          </p>
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

      {/* Animation styles */}
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in {
          animation: fadeIn 0.6s ease-out forwards;
        }
      `}</style>
    </div>
  )
}

export default ProfilePage