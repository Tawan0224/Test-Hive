import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/layout/Navbar'

// Sample user data
const sampleUser = {
  displayName: 'John Cena',
  username: 'johncena114',
  profilePicture: 'https://i.pravatar.cc/300?img=12',
  lastActive: 'now',
  bio: 'Learning enthusiast | Quiz lover',
  joinedDate: 'January 2025',
  stats: {
    quizzesCompleted: 42,
    quizzesCreated: 12,
    currentStreak: 7,
  }
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
  {
    id: 4,
    name: 'Streak Master',
    icon: '🔥',
    description: 'Maintain a 7-day streak',
    unlocked: true,
  },
]

// Sample test history data
const sampleTestHistory = [
  {
    id: 1,
    title: 'Web Development MCQ',
    type: 'multiple-choice',
    score: 85,
    completedAt: '2 days ago',
  },
  {
    id: 2,
    title: 'Computer Architecture Flash Card',
    type: 'flashcard',
    score: 92,
    completedAt: '3 days ago',
  },
  {
    id: 3,
    title: 'Cloud Computing Matching',
    type: 'matching',
    score: 78,
    completedAt: '4 days ago',
  },
  {
    id: 4,
    title: 'Micro-economic MCQ',
    type: 'multiple-choice',
    score: 90,
    completedAt: '5 days ago',
  },
  {
    id: 5,
    title: 'Data Structures Quiz',
    type: 'multiple-choice',
    score: 95,
    completedAt: '1 week ago',
  },
]

const ProfilePage = () => {
  const navigate = useNavigate()
  const [user] = useState(sampleUser)
  const [achievements] = useState(sampleAchievements)
  const [testHistory] = useState(sampleTestHistory)

  const handleEditProfile = () => {
    navigate('/profile/edit')
  }

  // Get quiz type icon
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'multiple-choice':
        return (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        )
      case 'flashcard':
        return (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        )
      case 'matching':
        return (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
        )
      default:
        return null
    }
  }



  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <Navbar />
      
      <main className="relative z-10 pt-24 px-6 pb-12">
        <div className="max-w-5xl mx-auto">
          {/* GitHub-style layout: sidebar + main content */}
          <div className="flex flex-col lg:flex-row gap-6">
            
            {/* Left Sidebar - User Profile Card */}
            <div className="lg:w-72 flex-shrink-0">
              <div className="sticky top-28">
                {/* Avatar */}
                <div className="mb-4">
                  <div className="relative w-full aspect-square max-w-[296px] mx-auto lg:mx-0">
                    <img
                      src={user.profilePicture}
                      alt={user.displayName}
                      className="w-full h-full rounded-full border-2 border-[#30363d] object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none'
                      }}
                    />
                  </div>
                </div>

                {/* User Info */}
                <div className="mb-4">
                  <h1 className="text-2xl font-semibold text-white">
                    {user.displayName}
                  </h1>
                  <p className="text-xl text-[#7d8590] font-light">
                    {user.username}
                  </p>
                </div>

                {/* Bio */}
                {user.bio && (
                  <p className="text-[#7d8590] text-sm mb-4">
                    {user.bio}
                  </p>
                )}

                {/* Edit Profile Button */}
                <button
                  onClick={handleEditProfile}
                  className="w-full py-1.5 px-3 bg-[#21262d] hover:bg-[#30363d]
                           border border-[#30363d] hover:border-[#8b949e]
                           rounded-md text-sm text-[#c9d1d9] font-medium
                           transition-colors duration-200"
                >
                  Edit profile
                </button>

                {/* Stats */}
                <div className="flex items-center gap-4 mt-4 text-sm">
                  <div className="flex items-center gap-1 text-[#7d8590]">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-white font-semibold">{user.stats.quizzesCompleted}</span>
                    <span>completed</span>
                  </div>
                  <div className="flex items-center gap-1 text-[#7d8590]">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    <span className="text-white font-semibold">{user.stats.quizzesCreated}</span>
                    <span>created</span>
                  </div>
                </div>

                {/* Additional Info */}
                <div className="mt-4 space-y-1 text-sm text-[#7d8590]">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                    </svg>
                    <span>{user.stats.currentStreak} day streak</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Last active {user.lastActive}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>Joined {user.joinedDate}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 min-w-0">
              {/* Achievements Section */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-4 pb-2 border-b border-[#21262d]">
                  <svg className="w-5 h-5 text-[#7d8590]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                  <h2 className="text-base font-semibold text-white">
                    Achievements
                  </h2>
                  <span className="text-xs text-[#7d8590] bg-[#21262d] px-2 py-0.5 rounded-full">
                    {achievements.length}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {achievements.map((achievement) => (
                    <div
                      key={achievement.id}
                      className="group p-4 bg-[#161b22] border border-[#30363d] rounded-md
                               hover:border-[#8b949e] transition-colors duration-200 cursor-pointer"
                      title={achievement.description}
                    >
                      <div className="text-center">
                        <div className="text-3xl mb-2">{achievement.icon}</div>
                        <p className="text-xs text-[#7d8590] group-hover:text-[#c9d1d9] transition-colors">
                          {achievement.name}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Test History Section */}
              <div>
                <div className="flex items-center gap-2 mb-4 pb-2 border-b border-[#21262d]">
                  <svg className="w-5 h-5 text-[#7d8590]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h2 className="text-base font-semibold text-white">
                    Recent Activity
                  </h2>
                </div>
                
                <div className="space-y-2">
                  {testHistory.map((test) => (
                    <div
                      key={test.id}
                      onClick={() => console.log('View test:', test.id)}
                      className="flex items-center justify-between p-3 bg-[#161b22] border border-[#30363d] rounded-md
                               hover:border-[#8b949e] transition-colors duration-200 cursor-pointer"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="text-[#7d8590]">
                          {getTypeIcon(test.type)}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm text-[#c9d1d9] font-medium truncate">
                            {test.title}
                          </p>
                          <p className="text-xs text-[#7d8590]">
                            {test.completedAt}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-sm font-medium text-[#c9d1d9]">
                          {test.score}%
                        </span>
                        <svg className="w-4 h-4 text-[#7d8590]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  ))}
                </div>

                {/* View All Link */}
                <div className="mt-4 text-center">
                  <button className="text-sm text-[#58a6ff] hover:underline">
                    View all activity →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default ProfilePage