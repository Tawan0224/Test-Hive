import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/layout/Navbar'
import { useAuth } from '../contexts/AuthContext'
import { authAPI } from '../services/api'

const EditProfilePage = () => {
  const navigate = useNavigate()
  const { user, isLoading: authLoading, isAuthenticated, updateUser } = useAuth()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // Form state
  const [formData, setFormData] = useState({
    displayName: '',
    username: '',
    email: '',
    profilePicture: '',
  })
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Password change state
  const [showPasswordSection, setShowPasswordSection] = useState(false)
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  })

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login')
    }
  }, [authLoading, isAuthenticated, navigate])

  // Populate form data from authenticated user
  useEffect(() => {
    if (user) {
      setFormData({
        displayName: user.displayName || '',
        username: user.username || '',
        email: user.email || '',
        profilePicture: user.profilePicture || '',
      })
    }
  }, [user])

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  // Handle password input changes
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setPasswordData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  // Handle image upload
  const handleImageClick = () => {
    fileInputRef.current?.click()
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, image: 'Image must be less than 5MB' }))
        return
      }
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewImage(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  // Validate form
  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.displayName.trim()) {
      newErrors.displayName = 'Name is required'
    }

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required'
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters'
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      newErrors.username = 'Username can only contain letters, numbers, and underscores'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Validate password
  const validatePassword = () => {
    const newErrors: Record<string, string> = {}

    if (!passwordData.currentPassword) {
      newErrors.currentPassword = 'Current password is required'
    }

    if (!passwordData.newPassword) {
      newErrors.newPassword = 'New password is required'
    } else if (passwordData.newPassword.length < 8) {
      newErrors.newPassword = 'Password must be at least 8 characters'
    } else if (!/(?=.*[A-Z])/.test(passwordData.newPassword)) {
      newErrors.newPassword = 'Password must contain at least one uppercase letter'
    } else if (!/(?=.*[0-9])/.test(passwordData.newPassword)) {
      newErrors.newPassword = 'Password must contain at least one number'
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    setErrors(prev => ({ ...prev, ...newErrors }))
    return Object.keys(newErrors).length === 0
  }

  // Handle form submission - calls real API
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setIsLoading(true)
    setErrors({})

    const response = await authAPI.updateProfile({
      displayName: formData.displayName.trim(),
      username: formData.username.trim(),
      email: formData.email.trim(),
    })

    setIsLoading(false)

    if (response.success && response.data) {
      // Update user in AuthContext so profile page shows new data immediately
      updateUser((response.data as any).user)
      // Navigate back to profile page
      navigate('/profile')
    } else {
      // Show error from server
      const errorMessage = response.error?.message || 'Failed to update profile'
      const errorCode = response.error?.code

      // Map specific errors to form fields
      if (errorCode === 'USERNAME_EXISTS') {
        setErrors({ username: errorMessage })
      } else if (errorCode === 'EMAIL_EXISTS') {
        setErrors({ email: errorMessage })
      } else {
        setErrors({ general: errorMessage })
      }
    }
  }

  // Handle password change submission
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validatePassword()) return

    setIsLoading(true)
    
    // TODO: Implement API call to change password
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    setIsLoading(false)
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
    setShowPasswordSection(false)
  }

  // Handle cancel
  const handleCancel = () => {
    navigate('/profile')
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

  // Show loading state
  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="text-[#7d8590] text-lg">Loading...</div>
      </div>
    )
  }

  const avatarSrc = previewImage || formData.profilePicture

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <Navbar />
      
      <main className="relative z-10 pt-24 px-6 pb-12">
        <div className="max-w-2xl mx-auto">
          {/* Page Header */}
          <div className="mb-6 pb-6 border-b border-[#21262d]">
            <h1 className="text-2xl font-semibold text-white">
              Public profile
            </h1>
          </div>

          {/* General Error Message */}
          {errors.general && (
            <div className="mb-6 p-4 bg-[#f85149]/10 border border-[#f85149]/30 rounded-md">
              <div className="flex items-center gap-2 text-[#f85149]">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm font-medium">{errors.general}</span>
              </div>
            </div>
          )}

          {/* Profile Form */}
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col md:flex-row gap-8">
              {/* Left: Form Fields */}
              <div className="flex-1 space-y-6">
                {/* Display Name */}
                <div>
                  <label htmlFor="displayName" className="block text-sm font-medium text-white mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    id="displayName"
                    name="displayName"
                    value={formData.displayName}
                    onChange={handleChange}
                    className={`w-full px-3 py-1.5 bg-[#0d1117] border rounded-md text-[#c9d1d9] text-sm
                             placeholder-[#484f58] outline-none transition-colors duration-200
                             ${errors.displayName 
                               ? 'border-[#f85149] focus:border-[#f85149]' 
                               : 'border-[#30363d] focus:border-[#58a6ff]'}`}
                    placeholder="Your display name"
                  />
                  {errors.displayName && (
                    <p className="mt-1 text-xs text-[#f85149]">{errors.displayName}</p>
                  )}
                </div>

                {/* Username */}
                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-white mb-2">
                    Username
                  </label>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    className={`w-full px-3 py-1.5 bg-[#0d1117] border rounded-md text-[#c9d1d9] text-sm
                             placeholder-[#484f58] outline-none transition-colors duration-200
                             ${errors.username 
                               ? 'border-[#f85149] focus:border-[#f85149]' 
                               : 'border-[#30363d] focus:border-[#58a6ff]'}`}
                    placeholder="Your username"
                  />
                  {errors.username && (
                    <p className="mt-1 text-xs text-[#f85149]">{errors.username}</p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-white mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full px-3 py-1.5 bg-[#0d1117] border rounded-md text-[#c9d1d9] text-sm
                             placeholder-[#484f58] outline-none transition-colors duration-200
                             ${errors.email 
                               ? 'border-[#f85149] focus:border-[#f85149]' 
                               : 'border-[#30363d] focus:border-[#58a6ff]'}`}
                    placeholder="Enter your email"
                  />
                  {errors.email && (
                    <p className="mt-1 text-xs text-[#f85149]">{errors.email}</p>
                  )}
                </div>
              </div>

              {/* Right: Profile Picture */}
              <div className="md:w-48 flex-shrink-0">
                <label className="block text-sm font-medium text-white mb-2">
                  Profile picture
                </label>
                <div className="relative">
                  <div 
                    onClick={handleImageClick}
                    className="w-48 h-48 rounded-full overflow-hidden border-2 border-[#30363d] 
                             cursor-pointer hover:opacity-80 transition-opacity duration-200"
                  >
                    {avatarSrc ? (
                      <img
                        src={avatarSrc}
                        alt="Profile"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none'
                        }}
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-[#8B5CF6] to-[#6366F1] flex items-center justify-center">
                        <span className="text-4xl font-bold text-white">
                          {getInitials(formData.displayName || formData.username || 'U')}
                        </span>
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={handleImageClick}
                    className="absolute bottom-2 right-2 p-2 bg-[#21262d] border border-[#30363d] 
                             rounded-md hover:bg-[#30363d] transition-colors duration-200"
                  >
                    <svg className="w-4 h-4 text-[#c9d1d9]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </div>
                {errors.image && (
                  <p className="mt-2 text-xs text-[#f85149]">{errors.image}</p>
                )}
              </div>
            </div>

            {/* Divider */}
            <div className="my-8 border-t border-[#21262d]" />

            {/* Password Change Section */}
            {!showPasswordSection ? (
              <div className="mb-8">
                <button
                  type="button"
                  onClick={() => setShowPasswordSection(true)}
                  className="text-sm text-[#58a6ff] hover:underline"
                >
                  Change password
                </button>
              </div>
            ) : (
              <div className="mb-8 p-4 border border-[#30363d] rounded-md">
                <h3 className="text-sm font-medium text-white mb-4">Change password</h3>
                
                {/* Current Password */}
                <div className="mb-4">
                  <label className="block text-xs text-[#7d8590] mb-1">Old password</label>
                  <div className="relative">
                    <input
                      type={showPasswords.current ? 'text' : 'password'}
                      name="currentPassword"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      className={`w-full px-3 py-1.5 bg-[#0d1117] border rounded-md text-[#c9d1d9] text-sm
                               outline-none transition-colors duration-200
                               ${errors.currentPassword ? 'border-[#f85149]' : 'border-[#30363d] focus:border-[#58a6ff]'}`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7d8590] hover:text-white text-xs"
                    >
                      {showPasswords.current ? 'Hide' : 'Show'}
                    </button>
                  </div>
                  {errors.currentPassword && <p className="mt-1 text-xs text-[#f85149]">{errors.currentPassword}</p>}
                </div>

                {/* New Password */}
                <div className="mb-4">
                  <label className="block text-xs text-[#7d8590] mb-1">New password</label>
                  <div className="relative">
                    <input
                      type={showPasswords.new ? 'text' : 'password'}
                      name="newPassword"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      className={`w-full px-3 py-1.5 bg-[#0d1117] border rounded-md text-[#c9d1d9] text-sm
                               outline-none transition-colors duration-200
                               ${errors.newPassword ? 'border-[#f85149]' : 'border-[#30363d] focus:border-[#58a6ff]'}`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7d8590] hover:text-white text-xs"
                    >
                      {showPasswords.new ? 'Hide' : 'Show'}
                    </button>
                  </div>
                  {errors.newPassword && <p className="mt-1 text-xs text-[#f85149]">{errors.newPassword}</p>}
                </div>

                {/* Confirm Password */}
                <div className="mb-4">
                  <label className="block text-xs text-[#7d8590] mb-1">Confirm new password</label>
                  <div className="relative">
                    <input
                      type={showPasswords.confirm ? 'text' : 'password'}
                      name="confirmPassword"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      className={`w-full px-3 py-1.5 bg-[#0d1117] border rounded-md text-[#c9d1d9] text-sm
                               outline-none transition-colors duration-200
                               ${errors.confirmPassword ? 'border-[#f85149]' : 'border-[#30363d] focus:border-[#58a6ff]'}`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7d8590] hover:text-white text-xs"
                    >
                      {showPasswords.confirm ? 'Hide' : 'Show'}
                    </button>
                  </div>
                  {errors.confirmPassword && <p className="mt-1 text-xs text-[#f85149]">{errors.confirmPassword}</p>}
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handlePasswordSubmit}
                    disabled={isLoading}
                    className="px-4 py-1.5 bg-[#238636] hover:bg-[#2ea043] border border-[#238636]
                             rounded-md text-sm font-medium text-white
                             transition-colors duration-200 disabled:opacity-50"
                  >
                    {isLoading ? 'Updating...' : 'Update password'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowPasswordSection(false)
                      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
                      setErrors({})
                    }}
                    className="px-4 py-1.5 bg-[#21262d] hover:bg-[#30363d] border border-[#30363d]
                             rounded-md text-sm font-medium text-[#c9d1d9]
                             transition-colors duration-200"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-1.5 bg-[#238636] hover:bg-[#2ea043] border border-[#238636]
                         rounded-md text-sm font-medium text-white
                         transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Saving...' : 'Update profile'}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-1.5 bg-[#21262d] hover:bg-[#30363d] border border-[#30363d]
                         rounded-md text-sm font-medium text-[#c9d1d9]
                         transition-colors duration-200"
              >
                Cancel
              </button>
            </div>
          </form>

          {/* Danger Zone */}
          <div className="mt-12 pt-8 border-t border-[#21262d]">
            <h2 className="text-lg font-semibold text-[#f85149] mb-4">
              Danger zone
            </h2>
            <div className="p-4 border border-[#f85149]/30 rounded-md bg-[#f85149]/5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-white">
                    Delete account
                  </h3>
                  <p className="text-sm text-[#7d8590] mt-1">
                    Once you delete your account, there is no going back. Please be certain.
                  </p>
                </div>
                <button
                  type="button"
                  className="px-4 py-1.5 bg-transparent hover:bg-[#da3633] border border-[#f85149]
                           rounded-md text-sm font-medium text-[#f85149] hover:text-white
                           transition-colors duration-200"
                >
                  Delete account
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default EditProfilePage