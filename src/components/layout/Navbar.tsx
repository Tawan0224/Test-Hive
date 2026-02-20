import { useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useRouteFade } from './RouteFadeProvider'

const Navbar = () => {
  const location = useLocation()
  const { logout } = useAuth()
  const { fadeTo } = useRouteFade()

  const handleLogout = () => {
    logout()
    fadeTo('/login')
  }

  const isActive = (path: string) => location.pathname === path

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-dark-900/80 border-b border-white/5 px-8 py-6">
      <div className="max-w-7xl mx-auto flex items-center justify-between">

        {/* Logo — triggers fade transition */}
        <button
          onClick={() => fadeTo('/home')}
          className="flex items-center gap-3 text-2xl font-display font-bold tracking-wider text-white
                     hover:text-hive-purple-light transition-colors duration-300"
        >
          <img src="/favicon.ico" alt="TestHive Logo" className="w-8 h-8" />
          <span className="italic">TestHive</span>
        </button>

        {/* Navigation Links */}
        <div className="flex items-center gap-10">
          <button
            onClick={() => fadeTo('/home')}
            className={`nav-link ${isActive('/home') ? 'text-hive-purple-light' : ''}`}
          >
            Home
          </button>
          <button
            onClick={() => fadeTo('/profile')}
            className={`nav-link ${isActive('/profile') ? 'text-hive-purple-light' : ''}`}
          >
            Profile
          </button>
          <button
            onClick={handleLogout}
            className="nav-link hover:text-red-400"
          >
            Logout
          </button>
        </div>

      </div>
    </nav>
  )
}

export default Navbar