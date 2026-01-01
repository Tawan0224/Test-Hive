import { Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import AboutPage from './pages/AboutPage'
import ProfilePage from './pages/ProfilePage'

function App() {
  return (
    <div className="relative min-h-screen">
      {/* Background noise texture */}
      <div className="bg-noise" />
      
      {/* Ambient glow effects */}
      <div className="ambient-glow top-[-200px] right-[-200px]" />
      <div className="ambient-glow bottom-[-300px] left-[-200px]" />
      
      {/* Main content */}
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Routes>
    </div>
  )
}

export default App