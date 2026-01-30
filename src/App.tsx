import { Routes, Route } from "react-router-dom";

import HomePage from "./pages/HomePage";
import AboutPage from "./pages/AboutPage";
import ProfilePage from "./pages/ProfilePage";
import AIGeneratePage from "./pages/AIGeneratePage";
import IntroPage from "./pages/IntroPage";
import MultipleChoiceQuiz from "./pages/MultipleChoiceQuiz";
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
      {/* Intro first */}
      <Route path="/" element={<IntroPage />} />

      {/* Auth */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />

      {/* Main pages */}
      <Route path="/home" element={<HomePage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/profile" element={<ProfilePage />} />

      {/* Quiz generation */}
      <Route path="/quiz/create" element={<AIGeneratePage />} />
      <Route path="/ai-generate" element={<AIGeneratePage />} />

      {/* Quiz taking */}
      <Route path="/quiz/multiple-choice" element={<MultipleChoiceQuiz />} />
      <Route path="/multiple-choice-quiz" element={<MultipleChoiceQuiz />} />
      
      {/* Quiz results */}
      <Route path="/quiz-results" element={<QuizResultsPage />} />
    </Routes>
  );
}

export default function App() {
  return (
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
  );
}