import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/layout/Navbar'

// Sample user data (will be replaced with actual auth data later)
const initialUserData = {
  displayName: 'John Cena',
  username: 'johncena114',
  email: 'johncena@example.com',
  profilePicture: 'https://i.pravatar.cc/300?img=12',
  bio: 'Learning enthusiast | Quiz lover',
}

const EditProfilePage = () => {
  const navigate = useNavigate()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // Form state
  const [formData, setFormData] = useState(initialUserData)
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
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

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    // Clear error when user types
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

    if (formData.bio && formData.bio.length > 160) {
      newErrors.bio = 'Bio must be 160 characters or less'
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

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setIsLoading(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    setIsLoading(false)
    setSuccessMessage('Profile updated successfully!')
    
    // Clear success message after 3 seconds
    setTimeout(() => setSuccessMessage(''), 3000)
  }

  // Handle password change submission
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validatePassword()) return

    setIsLoading(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    setIsLoading(false)
    setSuccessMessage('Password changed successfully!')
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
    setShowPasswordSection(false)
    
    setTimeout(() => setSuccessMessage(''), 3000)
  }

  // Handle cancel
  const handleCancel = () => {
    navigate('/profile')
  }

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

          {/* Success Message */}
          {successMessage && (
            <div className="mb-6 p-4 bg-[#238636]/20 border border-[#238636] rounded-md">
              <div className="flex items-center gap-2 text-[#3fb950]">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-sm font-medium">{successMessage}</span>
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
                    placeholder="Enter your name"
                  />
                  {errors.displayName && (
                    <p className="mt-1 text-xs text-[#f85149]">{errors.displayName}</p>
                  )}
                  <p className="mt-1 text-xs text-[#7d8590]">
                    Your name may appear around TestHive where you contribute or are mentioned.
                  </p>
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
                    placeholder="Enter your username"
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

                {/* Bio */}
                <div>
                  <label htmlFor="bio" className="block text-sm font-medium text-white mb-2">
                    Bio
                  </label>
                  <textarea
                    id="bio"
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    rows={3}
                    className={`w-full px-3 py-1.5 bg-[#0d1117] border rounded-md text-[#c9d1d9] text-sm
                             placeholder-[#484f58] outline-none transition-colors duration-200 resize-none
                             ${errors.bio 
                               ? 'border-[#f85149] focus:border-[#f85149]' 
                               : 'border-[#30363d] focus:border-[#58a6ff]'}`}
                    placeholder="Tell us a little bit about yourself"
                  />
                  <div className="flex justify-between mt-1">
                    {errors.bio ? (
                      <p className="text-xs text-[#f85149]">{errors.bio}</p>
                    ) : (
                      <p className="text-xs text-[#7d8590]">
                        You can @mention other users to link to them.
                      </p>
                    )}
                    <span className={`text-xs ${formData.bio.length > 160 ? 'text-[#f85149]' : 'text-[#7d8590]'}`}>
                      {formData.bio.length}/160
                    </span>
                  </div>
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
                    <img
                      src={previewImage || formData.profilePicture}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
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

          {/* Password Section */}
          <div className="mt-12 pt-8 border-t border-[#21262d]">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold text-white">
                  Change password
                </h2>
                <p className="text-sm text-[#7d8590] mt-1">
                  Update your password associated with your account.
                </p>
              </div>
              {!showPasswordSection && (
                <button
                  type="button"
                  onClick={() => setShowPasswordSection(true)}
                  className="px-4 py-1.5 bg-[#21262d] hover:bg-[#30363d] border border-[#30363d]
                           rounded-md text-sm font-medium text-[#c9d1d9]
                           transition-colors duration-200"
                >
                  Change password
                </button>
              )}
            </div>

            {showPasswordSection && (
              <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-md">
                {/* Current Password */}
                <div>
                  <label htmlFor="currentPassword" className="block text-sm font-medium text-white mb-2">
                    Current password
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.current ? 'text' : 'password'}
                      id="currentPassword"
                      name="currentPassword"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      className={`w-full px-3 py-1.5 pr-10 bg-[#0d1117] border rounded-md text-[#c9d1d9] text-sm
                               placeholder-[#484f58] outline-none transition-colors duration-200
                               ${errors.currentPassword 
                                 ? 'border-[#f85149] focus:border-[#f85149]' 
                                 : 'border-[#30363d] focus:border-[#58a6ff]'}`}
                      placeholder="Enter current password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-[#7d8590] hover:text-[#c9d1d9]"
                    >
                      {showPasswords.current ? (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                  {errors.currentPassword && (
                    <p className="mt-1 text-xs text-[#f85149]">{errors.currentPassword}</p>
                  )}
                </div>

                {/* New Password */}
                <div>
                  <label htmlFor="newPassword" className="block text-sm font-medium text-white mb-2">
                    New password
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.new ? 'text' : 'password'}
                      id="newPassword"
                      name="newPassword"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      className={`w-full px-3 py-1.5 pr-10 bg-[#0d1117] border rounded-md text-[#c9d1d9] text-sm
                               placeholder-[#484f58] outline-none transition-colors duration-200
                               ${errors.newPassword 
                                 ? 'border-[#f85149] focus:border-[#f85149]' 
                                 : 'border-[#30363d] focus:border-[#58a6ff]'}`}
                      placeholder="Enter new password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-[#7d8590] hover:text-[#c9d1d9]"
                    >
                      {showPasswords.new ? (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                  {errors.newPassword && (
                    <p className="mt-1 text-xs text-[#f85149]">{errors.newPassword}</p>
                  )}
                  <p className="mt-1 text-xs text-[#7d8590]">
                    Must be at least 8 characters with 1 uppercase letter and 1 number.
                  </p>
                </div>

                {/* Confirm Password */}
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-white mb-2">
                    Confirm new password
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.confirm ? 'text' : 'password'}
                      id="confirmPassword"
                      name="confirmPassword"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      className={`w-full px-3 py-1.5 pr-10 bg-[#0d1117] border rounded-md text-[#c9d1d9] text-sm
                               placeholder-[#484f58] outline-none transition-colors duration-200
                               ${errors.confirmPassword 
                                 ? 'border-[#f85149] focus:border-[#f85149]' 
                                 : 'border-[#30363d] focus:border-[#58a6ff]'}`}
                      placeholder="Confirm new password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-[#7d8590] hover:text-[#c9d1d9]"
                    >
                      {showPasswords.confirm ? (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="mt-1 text-xs text-[#f85149]">{errors.confirmPassword}</p>
                  )}
                </div>

                {/* Password Action Buttons */}
                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="px-4 py-1.5 bg-[#238636] hover:bg-[#2ea043] border border-[#238636]
                             rounded-md text-sm font-medium text-white
                             transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
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
              </form>
            )}
          </div>

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