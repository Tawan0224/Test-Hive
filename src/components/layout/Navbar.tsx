import { Link, useLocation, useNavigate } from 'react-router-dom'

const Navbar = () => {
  const location = useLocation()
  const navigate = useNavigate()

  const handleLogout = () => {
    // For now, just navigate to login page (no actual auth)
    navigate('/login')
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-8 py-6">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link 
          to="/home" 
          className="text-2xl font-display font-bold tracking-wider text-white
                     hover:text-hive-purple-light transition-colors duration-300"
        >
          TestHive
        </Link>

        {/* Navigation Links */}
        <div className="flex items-center gap-12">
          <Link 
            to="/about" 
            className={`nav-link ${location.pathname === '/about' ? 'text-hive-purple-light' : ''}`}
          >
            About
          </Link>
          <Link 
            to="/profile" 
            className={`nav-link ${location.pathname === '/profile' ? 'text-hive-purple-light' : ''}`}
          >
            Profile
          </Link>
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