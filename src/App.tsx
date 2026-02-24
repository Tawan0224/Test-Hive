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
import { LoginPage, SignupPage } from "./pages/auth";

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
      <Route path="/home" element={<HomePage />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/profile/edit" element={<EditProfilePage />} />

      {/* Quiz generation */}
      <Route path="/quiz/create" element={<AIGeneratePage />} />

      {/* Quiz taking */}
      <Route path="/quiz/multiple-choice" element={<MultipleChoiceQuiz />} />
      <Route path="/quiz/matching" element={<MatchingQuiz />} />
      <Route path="/quiz/flashcard" element={<FlashcardQuiz />} />
      
      {/* Quiz results */}
      <Route path="/quiz-results" element={<QuizResultsPage />} />

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