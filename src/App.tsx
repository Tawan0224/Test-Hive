import { Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import AboutPage from './pages/AboutPage'
import ProfilePage from './pages/ProfilePage'
import AIGeneratePage from './pages/AIGeneratePage'
import { LoginPage, SignupPage } from './pages/auth'

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
        {/* Auth Routes - Default starts with login */}
        <Route path="/" element={<LoginPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        
        {/* Protected Routes (after login) */}
        <Route path="/home" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        
        {/* AI Quiz Generation */}
        <Route path="/quiz/create" element={<AIGeneratePage />} />
        <Route path="/ai-generate" element={<AIGeneratePage />} />
      </Routes>
    </div>
  )
}

export default App