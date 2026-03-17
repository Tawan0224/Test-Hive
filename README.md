# TestHive

A gamified quiz platform where users can generate quizzes from PDFs, play multiple study modes, host live quiz battles, and track their learning progress.

## Project Description

TestHive is a full-stack learning application built for interactive quiz creation and quiz-based study. It helps users:

- Generate quizzes from PDF study materials using AI
- Create and play multiple quiz formats including multiple choice, matching, and flashcards
- Join quizzes instantly with share codes
- Host live multiplayer quiz sessions for real-time competition
- Track quiz attempts, streaks, scores, and achievements
- Manage personal quiz libraries and profile information
- Sign in securely with email/password, Google, or Microsoft

## Key Features

- AI Quiz Generation: Upload a PDF and generate quizzes with Anthropic-powered question creation
- Multiple Quiz Types: Supports multiple-choice quizzes, matching activities, and flashcard decks
- Live Sessions: Host and join real-time quiz rooms with Socket.IO
- Quiz Sharing: Share quizzes through generated codes and QR-based flows
- Gamified Experience: Achievements, score tracking, streaks, and performance stats
- Social Login: Email/password authentication plus Google and Microsoft login
- Profile Management: Update account details and manage your learning profile
- 3D Visual Elements: Includes Three.js-powered mascot and scene assets for a more playful experience

## Technical Stack

- Frontend: React 18 + TypeScript + Vite
- Styling: Tailwind CSS 3
- Routing: React Router
- Icons: Lucide React
- 3D / Visuals: Three.js, `@react-three/fiber`, `@react-three/drei`
- Backend: Node.js + Express
- Database: MongoDB with Mongoose
- Authentication: JWT, Google OAuth, Microsoft OAuth
- Realtime: Socket.IO
- File Uploads: Multer
- PDF Parsing: `pdfjs-dist`
- AI Integration: Anthropic Claude API
- Deployment: Vercel-ready frontend and persistent backend deployment via Render Node host

##  Team

- Wai Yan Mya Thaung
- Soe Min Min Latt
- Aung Khant Zaw
