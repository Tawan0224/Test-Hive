import { Routes, Route, Link } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";

import HomePage from "./pages/HomePage";
import ProfilePage from "./pages/ProfilePage";
import EditProfilePage from "./pages/EditProfilePage";
import AIGeneratePage from "./pages/AIGeneratePage";
import IntroPage from "./pages/IntroPage";
import MultipleChoiceQuiz from "./pages/MultipleChoiceQuiz";
import MatchingQuiz from "./pages/MatchingQuiz";
import FlashcardQuiz from "./pages/FlashcardQuiz";
import QuizResultsPage from "./pages/QuizResultsPage";
import LiveSessionHost from "./pages/LiveSessionHost";
import LiveSessionPlay from "./pages/LiveSessionPlay";
import { LoginPage, SignupPage } from "./pages/auth";
import ProtectedRoute from "./components/ProtectedRoute";
import { LiveSessionProvider } from "./contexts/LiveSessionContext";

import { RouteFadeProvider, useRouteFade } from "./components/layout/RouteFadeProvider";

function GlobalFadeOverlay() {
  const { active } = useRouteFade();

  return (
    <div className={`route-fade-overlay ${active ? "is-active" : ""}`} />
  );
}

function AppRoutes() {
  return (
    <Routes>
      {/* Intro */}
      <Route path="/" element={<IntroPage />} />

      {/* Auth */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />

      {/* Main pages */}
      <Route path="/home" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
      <Route path="/profile/edit" element={<ProtectedRoute><EditProfilePage /></ProtectedRoute>} />

      {/* Quiz generation */}
      <Route path="/quiz/create" element={<ProtectedRoute><AIGeneratePage /></ProtectedRoute>} />

      {/* Quiz taking */}
      <Route path="/quiz/multiple-choice" element={<ProtectedRoute><MultipleChoiceQuiz /></ProtectedRoute>} />
      <Route path="/quiz/matching" element={<ProtectedRoute><MatchingQuiz /></ProtectedRoute>} />
      <Route path="/quiz/flashcard" element={<ProtectedRoute><FlashcardQuiz /></ProtectedRoute>} />

      {/* Quiz results */}
      <Route path="/quiz-results" element={<ProtectedRoute><QuizResultsPage /></ProtectedRoute>} />

      {/* Live sessions */}
      <Route path="/live/host/:sessionCode" element={<ProtectedRoute><LiveSessionProvider><LiveSessionHost /></LiveSessionProvider></ProtectedRoute>} />
      <Route path="/live/play" element={<ProtectedRoute><LiveSessionProvider><LiveSessionPlay /></LiveSessionProvider></ProtectedRoute>} />
      <Route path="/live/join/:code" element={<ProtectedRoute><LiveSessionProvider><LiveSessionPlay /></LiveSessionProvider></ProtectedRoute>} />

      {/* 404 */}
      <Route path="*" element={
        <div className="min-h-screen flex flex-col items-center justify-center text-white">
          <h1 className="text-6xl font-bold font-orbitron mb-4">404</h1>
          <p className="text-xl text-gray-400 mb-8">Page not found</p>
          <Link to="/home" className="px-6 py-3 bg-hive-purple rounded-lg hover:bg-hive-purple-light transition-colors">
            Go Home
          </Link>
        </div>
      } />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <div className="relative min-h-screen">
        {/* Background noise texture */}
        <div className="bg-noise" />

        {/* Ambient glow effects */}
        <div className="ambient-glow top-[-200px] right-[-200px]" />
        <div className="ambient-glow bottom-[-300px] left-[-200px]" />

        {/* Provider enables fade transitions everywhere */}
        <RouteFadeProvider durationMs={260}>
          {/* Global overlay sits above everything */}
          <GlobalFadeOverlay />

          {/* Routes */}
          <AppRoutes />
        </RouteFadeProvider>
      </div>
    </AuthProvider>
  );
}