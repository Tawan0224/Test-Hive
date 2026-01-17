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
    <div className="min-h-screen">
      <Navbar />
      
      {/* Blue ambient glow effects */}
      <div className="fixed top-[-10%] right-[10%] w-[600px] h-[600px] rounded-full bg-blue-500/10 blur-[150px] pointer-events-none" />
      <div className="fixed bottom-[-20%] left-[-5%] w-[500px] h-[500px] rounded-full bg-cyan-500/8 blur-[130px] pointer-events-none" />
      
      <main className="relative z-10 pt-28 px-8 pb-12">
        <div className="max-w-6xl mx-auto">
          {/* Main Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Left Card - User Profile */}
            <div className="relative group">
              {/* Card glow effect - Blue theme */}
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/20 via-cyan-500/20 to-blue-500/20 rounded-3xl blur-xl opacity-50 group-hover:opacity-70 transition-opacity duration-500" />
              
              <div className="relative bg-[#0d1525]/80 backdrop-blur-xl rounded-2xl p-8 border border-blue-500/20 min-h-[500px]">
                {/* Profile Picture */}
                <div className="flex justify-center mb-6">
                  <div className="relative">
                    {/* Glow behind avatar - Blue theme */}
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/40 to-cyan-500/40 rounded-full blur-xl" />
                    
                    {/* Avatar container with border - Blue theme */}
                    <div className="relative w-40 h-40 rounded-full p-1 bg-gradient-to-br from-blue-500/50 via-transparent to-cyan-500/50">
                      <div className="w-full h-full rounded-full overflow-hidden bg-[#0d1525]">
                        <img
                          src={user.profilePicture}
                          alt={user.displayName}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            // Fallback to initials if image fails to load
                            e.currentTarget.style.display = 'none'
                          }}
                        />
                        {/* Fallback initials */}
                        <div className="absolute inset-0 flex items-center justify-center text-4xl font-bold text-white/60">
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
                  <p className="text-white/50 text-lg mb-4">
                    @{user.username}
                  </p>
                  <p className="text-white/40 text-sm">
                    last time is {user.lastActive}
                  </p>
                </div>

                {/* Edit Profile Button - Blue theme */}
                <button
                  onClick={handleEditProfile}
                  className="w-full py-4 bg-[#0d1525]/80 hover:bg-[#152035] 
                           border border-white/10 hover:border-blue-500/30
                           rounded-xl text-white font-medium
                           transition-all duration-300
                           hover:shadow-lg hover:shadow-blue-500/10"
                >
                  Edit Profile
                </button>
              </div>
            </div>

            {/* Right Card - Achievements & Test History */}
            <div className="relative group">
              {/* Card glow effect - Blue theme */}
              <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-cyan-500/20 rounded-3xl blur-xl opacity-50 group-hover:opacity-70 transition-opacity duration-500" />
              
              <div className="relative bg-[#0d1525]/80 backdrop-blur-xl rounded-2xl p-8 border border-blue-500/20 min-h-[500px]">
                {/* Achievements Section */}
                <div className="mb-10">
                  <h3 className="text-2xl font-display font-bold text-white mb-6">
                    Your Achievements
                  </h3>
                  
                  <div className="flex gap-6 justify-start">
                    {achievements.map((achievement) => (
                      <div
                        key={achievement.id}
                        className="relative group/badge cursor-pointer"
                        title={achievement.description}
                      >
                        {/* Achievement badge container */}
                        <div className="relative">
                          {/* Glow effect on hover */}
                          <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/30 to-orange-500/30 rounded-full blur-xl opacity-0 group-hover/badge:opacity-100 transition-opacity duration-300" />
                          
                          {/* Badge */}
                          <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-[#1a2540] to-[#0d1525] border-2 border-yellow-500/40 flex items-center justify-center
                                        shadow-lg shadow-yellow-500/10 hover:shadow-yellow-500/20 hover:border-yellow-500/60 hover:scale-110
                                        transition-all duration-300">
                            {/* Belt/Badge icon - using championship belt style */}
                            <div className="text-4xl">
                              {achievement.id === 1 && '🏆'}
                              {achievement.id === 2 && '🥇'}
                              {achievement.id === 3 && '🎖️'}
                            </div>
                          </div>
                        </div>
                        
                        {/* Achievement name */}
                        <p className="text-center text-white/70 text-sm mt-3 max-w-[80px]">
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
                          // TODO: Navigate to test results
                          console.log('View test:', test.id)
                        }}
                        className="p-4 bg-[#0d1525]/80 hover:bg-[#152035]
                                 border border-white/10 hover:border-blue-500/30
                                 rounded-xl text-left
                                 transition-all duration-300
                                 hover:shadow-lg hover:shadow-blue-500/10
                                 hover:scale-[1.02]"
                      >
                        <p className="text-white font-medium text-sm leading-tight">
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