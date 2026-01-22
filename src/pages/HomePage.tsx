import { useRouteFade } from "../components/layout/RouteFadeProvider";
import Navbar from "../components/layout/Navbar";
import Button from "../components/ui/Button";
import TreasureChest from "../components/three/TreasureChest";

const HomePage = () => {
  const { fadeTo } = useRouteFade();

  return (
    <div className="relative min-h-screen overflow-hidden">
      <Navbar />

      {/* Hero Section */}
      <main className="relative z-10 min-h-screen flex items-center">
        <div className="max-w-7xl mx-auto px-8 w-full">
          <div className="max-w-2xl">
            {/* Subtitle */}
            <p
              className="text-white/70 text-lg mb-4 font-body tracking-wide opacity-0"
              style={{
                animation: "fadeSlideUp 0.8s ease-out forwards",
                animationDelay: "0.2s",
              }}
            >
              Welcome to TestHive
            </p>

            {/* Main Heading */}
            <h1
              className="text-5xl md:text-6xl lg:text-7xl font-display font-bold 
                         text-white leading-tight mb-8 opacity-0"
              style={{
                animation: "fadeSlideUp 0.8s ease-out forwards",
                animationDelay: "0.4s",
              }}
            >
              A Learning <br />
              Platform for <br />
              <span className="text-gradient">Interactive Study</span>
            </h1>

            {/* CTA Button */}
            <div
              className="opacity-0"
              style={{
                animation: "fadeSlideUp 0.8s ease-out forwards",
                animationDelay: "0.6s",
              }}
            >
              <Button
                onClick={() => fadeTo("/quiz/create")}
                className="group"
              >
                <span className="flex items-center gap-2">
                  create quiz
                  <svg
                    className="w-4 h-4 transition-transform group-hover:translate-x-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                    />
                  </svg>
                </span>
              </Button>
            </div>
          </div>
        </div>

        {/* 3D Treasure Chest */}
        <TreasureChest />
      </main>

      {/* Keyframes for animations */}
      <style>{`
        @keyframes fadeSlideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default HomePage;
