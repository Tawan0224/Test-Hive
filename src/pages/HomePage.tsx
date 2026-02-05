import { useEffect, useRef, useState } from "react";
import { useRouteFade } from "../components/layout/RouteFadeProvider";
import Navbar from "../components/layout/Navbar";
import Button from "../components/ui/Button";
import TreasureChest from "../components/three/TreasureChest";

// Team members data
const teamMembers = [
  {
    name: "Wai Yan Mya Thaung",
    image: "", // Add your image path here
    linkedin: "#",
    email: "mailto:waiyan@example.com",
    github: "#",
  },
  {
    name: "Soe Min Min Latt",
    image: "", // Add your image path here
    linkedin: "#",
    email: "mailto:soeminmin@example.com",
    github: "#",
  },
  {
    name: "Aung Khant Zaw",
    image: "", // Add your image path here
    linkedin: "#",
    email: "mailto:aungkhant@example.com",
    github: "#",
  },
];

// Features data
const features = [
  {
    title: "Multiple Quiz Types",
    description: "Create and take Multiple Choice, Matching, and Flashcard quizzes.",
  },
  {
    title: "AI-Powered Generation",
    description: "Upload PDFs and let AI automatically generate questions for you.",
  },
  {
    title: "Gamified Learning",
    description: "Earn achievements, maintain streaks, and track your progress.",
  },
  {
    title: "Easy Sharing",
    description: "Share quizzes with friends via links or QR codes.",
  },
];

const HomePage = () => {
  const { fadeTo } = useRouteFade();
  const aboutRef = useRef<HTMLElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const teamRef = useRef<HTMLDivElement>(null);
  
  // Navbar visibility state
  const [navbarVisible, setNavbarVisible] = useState(true);
  const lastScrollY = useRef(0);

  // Handle navbar hide/show on scroll
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Show navbar when at top or scrolling up
      if (currentScrollY < 50 || currentScrollY < lastScrollY.current) {
        setNavbarVisible(true);
      } else {
        // Hide navbar when scrolling down
        setNavbarVisible(false);
      }
      
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Scroll animation observer
  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: "0px",
      threshold: 0.1,
    };

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("animate-scroll-in");
          entry.target.classList.remove("opacity-0", "translate-y-10");
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    // Observe all elements with scroll-animate class
    const elements = document.querySelectorAll(".scroll-animate");
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      {/* Navbar with hide/show animation */}
      <div 
        className={`transition-transform duration-300 ease-in-out ${
          navbarVisible ? 'translate-y-0' : '-translate-y-full'
        }`}
        style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50 }}
      >
        <nav className="px-8 py-6">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            {/* Logo with Icon */}
            <a 
              href="/home" 
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
            </a>

            {/* Navigation Links */}
            <div className="flex items-center gap-10">
              <a href="/home" className="nav-link">Home</a>
              <a href="/profile" className="nav-link">Profile</a>
              <a href="/login" className="nav-link hover:text-red-400">Logout</a>
            </div>
          </div>
        </nav>
      </div>

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
              <span className="text-hive-purple">Interactive Study</span>
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

        {/* Scroll Indicator */}
        <div 
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-0"
          style={{
            animation: "fadeSlideUp 0.8s ease-out forwards",
            animationDelay: "1s",
          }}
        >
          <span className="text-white/40 text-sm font-body">Scroll to explore</span>
          <div className="w-6 h-10 rounded-full border-2 border-white/20 flex justify-center pt-2">
            <div className="w-1.5 h-3 bg-white/40 rounded-full animate-bounce" />
          </div>
        </div>
      </main>

      {/* About Section */}
      <section ref={aboutRef} className="relative z-10 py-24 px-8">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-hive-purple/5 to-transparent pointer-events-none" />
        
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16 scroll-animate opacity-0 translate-y-10 transition-all duration-700">
            <h2 className="text-4xl md:text-5xl font-display font-bold text-white mb-6">
              About <span className="text-hive-purple">TestHive</span>
            </h2>
            <p className="text-white/60 text-lg max-w-2xl mx-auto font-body leading-relaxed">
              TestHive is a gamified learning platform where you can create, take, and share 
              quizzes and flashcards. Our AI-powered system can automatically generate questions 
              from your PDFs, making study material creation faster and more accessible.
            </p>
          </div>

          {/* Features Grid */}
          <div ref={featuresRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-24">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="scroll-animate opacity-0 translate-y-10 transition-all duration-700"
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <h3 className="text-xl font-display font-bold text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-white/40 font-body text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>

          {/* Team Section */}
          <div ref={teamRef} className="scroll-animate opacity-0 translate-y-10 transition-all duration-700">
            <div className="text-center mb-12">
              <h3 className="text-4xl md:text-5xl font-display font-bold text-white mb-4">
                Meet the team
              </h3>
              <div className="w-12 h-1 bg-white/30 mx-auto rounded-full" />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {teamMembers.map((member, index) => (
                <div
                  key={member.name}
                  className="scroll-animate opacity-0 translate-y-10 transition-all duration-700"
                  style={{ transitionDelay: `${index * 150}ms` }}
                >
                  <div className="relative group overflow-hidden rounded-xl">
                    {/* Image Container */}
                    <div className="aspect-square bg-gray-300 relative overflow-hidden">
                      {member.image ? (
                        <img
                          src={member.image}
                          alt={member.name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300" />
                      )}
                    </div>
                    
                    {/* Info Footer */}
                    <div className="bg-[#1a1f2e] p-5">
                      <h4 className="text-lg font-display font-medium text-white mb-4">
                        {member.name}
                      </h4>
                      
                      {/* Social Icons */}
                      <div className="flex items-center gap-4">
                        {/* LinkedIn */}
                        <a
                          href={member.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors duration-300"
                        >
                          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                          </svg>
                        </a>
                        
                        {/* Email */}
                        <a
                          href={member.email}
                          className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors duration-300"
                        >
                          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                        </a>
                        
                        {/* GitHub */}
                        <a
                          href={member.github}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors duration-300"
                        >
                          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                          </svg>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-8 px-8 border-t border-white/5">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-white/30 font-body text-sm">
            © 2026 TestHive. Built with love for Senior Project I.
          </p>
        </div>
      </footer>

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

        .animate-scroll-in {
          opacity: 1 !important;
          transform: translateY(0) !important;
        }
      `}</style>
    </div>
  );
};

export default HomePage;