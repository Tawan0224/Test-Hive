import { Link, useLocation, useNavigate } from 'react-router-dom'

const Navbar = () => {
  const location = useLocation()
  const navigate = useNavigate()

  const handleLogout = () => {
    navigate('/login')
  }

  // Check if current path matches
  const isActive = (path: string) => location.pathname === path

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-8 py-6">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo with Icon */}
        <Link 
          to="/home" 
          className="flex items-center gap-3 text-2xl font-display font-bold tracking-wider text-white
                     hover:text-hive-purple-light transition-colors duration-300"
        >
          {/* Favicon/Logo Icon */}
          <img 
            src="/favicon.ico" 
            alt="TestHive Logo" 
            className="w-8 h-8"
          />
          <span className="italic">TestHive</span>
        </Link>

        {/* Navigation Links */}
        <div className="flex items-center gap-10">
          <Link 
            to="/home" 
            className={`nav-link ${isActive('/home') ? 'text-hive-purple-light' : ''}`}
          >
            Home
          </Link>
          <Link 
            to="/profile" 
            className={`nav-link ${isActive('/profile') ? 'text-hive-purple-light' : ''}`}
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