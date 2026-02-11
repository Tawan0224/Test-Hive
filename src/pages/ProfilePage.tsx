import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/layout/Navbar'
import { useAuth } from '../contexts/AuthContext'

// Sample achievements data (keep until achievements are implemented in backend)
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

// Sample test history data (keep until quiz attempts are implemented in backend)
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
  const { user, isLoading, isAuthenticated } = useAuth()
  const [achievements] = useState(sampleAchievements)
  const [testHistory] = useState(sampleTestHistory)

  // Redirect to login only AFTER loading is complete and user is not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/login')
    }
  }, [isLoading, isAuthenticated, navigate])

  const handleEditProfile = () => {
    navigate('/profile/edit')
  }

  // Get quiz type icon
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'multiple-choice':
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        )
      case 'matching':
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
        )
      case 'flashcard':
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        )
      default:
        return null
    }
  }

  // Format the joined date from createdAt
  const formatJoinedDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  }

  // Generate initials for default avatar
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  // Show loading state while auth is being checked
  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="text-[#7d8590] text-lg">Loading profile...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <Navbar />

      <main className="relative z-10 pt-24 px-6 pb-12">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Left Sidebar - User Info */}
            <div className="md:w-72 flex-shrink-0">
              <div className="sticky top-28">
                {/* Profile Picture */}
                <div className="mb-4">
                  <div className="w-[296px] h-[296px] rounded-full overflow-hidden border border-[#30363d]">
                    {user.profilePicture ? (
                      <img
                        src={user.profilePicture}
                        alt={user.displayName}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none'
                        }}
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-[#8B5CF6] to-[#6366F1] flex items-center justify-center">
                        <span className="text-6xl font-bold text-white">
                          {getInitials(user.displayName || user.username)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* User Info */}
                <div className="mb-4">
                  <h1 className="text-2xl font-semibold text-white">
                    {user.displayName || user.username}
                  </h1>
                  <p className="text-xl text-[#7d8590] font-light">
                    {user.username}
                  </p>
                </div>

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
                    <span className="text-white font-semibold">{user.stats?.quizzesCompleted ?? 0}</span>
                    <span>completed</span>
                  </div>
                </div>

                {/* Additional Info */}
                <div className="mt-4 space-y-1 text-sm text-[#7d8590]">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                    </svg>
                    <span>{user.stats?.currentStreak ?? 0} day streak</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span>{user.email}</span>
                  </div>
                  {user.createdAt && (
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>Joined {formatJoinedDate(user.createdAt)}</span>
                    </div>
                  )}
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
                  <h2 className="text-base font-semibold text-[#c9d1d9]">Achievements</h2>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {achievements.map((achievement) => (
                    <div
                      key={achievement.id}
                      className={`p-3 rounded-md border text-center transition-colors duration-200
                        ${achievement.unlocked
                          ? 'bg-[#161b22] border-[#30363d] hover:border-[#8b949e]'
                          : 'bg-[#0d1117] border-[#21262d] opacity-50'
                        }`}
                    >
                      <div className="text-2xl mb-1">{achievement.icon}</div>
                      <p className="text-xs font-medium text-[#c9d1d9]">{achievement.name}</p>
                      <p className="text-[10px] text-[#7d8590] mt-0.5">{achievement.description}</p>
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
                  <h2 className="text-base font-semibold text-[#c9d1d9]">Recent Activity</h2>
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