# TestHive

TestHive is a gamified learning platform for creating, sharing, and playing quizzes.

## Features

- User authentication (email/password + Google/Microsoft/Facebook)
- AI quiz generation from PDF files
- Multiple quiz formats:
  - Multiple choice
  - Matching
  - Flashcards
- Quiz sharing via share code
- Live multiplayer quiz sessions with Socket.IO
- Progress tracking and achievements

## Tech Stack

- Frontend: React + TypeScript + Vite + Tailwind CSS
- Backend: Node.js + Express + MongoDB + Socket.IO
- AI: Anthropic API (Claude)

## Project Structure

```text
.
├── src/                 # Frontend app (Vite)
├── server/              # Backend API + sockets
├── public/              # Static assets and 3D models
└── README.md
```

## Prerequisites

- Node.js 20+
- pnpm (recommended) or npm
- MongoDB connection string
- Anthropic API key (for AI generation)

## Environment Variables

### Frontend (`.env` in project root)

```env
VITE_API_URL=http://localhost:5001/api
VITE_GOOGLE_CLIENT_ID=your_google_client_id
VITE_MICROSOFT_CLIENT_ID=your_microsoft_client_id
VITE_MICROSOFT_TENANT_ID=your_microsoft_tenant_id
```

### Backend (`server/.env`)

```env
PORT=5001
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
ANTHROPIC_API_KEY=your_anthropic_api_key
```

Notes:
- If backend `PORT` is not `5001`, update `VITE_API_URL` to match.
- `CLIENT_URL` can be comma-separated for multiple allowed origins.

## Installation

Install dependencies in both frontend and backend:

```bash
pnpm install
cd server && pnpm install
```

## Run Locally

### Option 1: Run both from root

```bash
pnpm dev:all
```

### Option 2: Run separately

Terminal 1 (frontend):

```bash
pnpm dev
```

Terminal 2 (backend):

```bash
cd server
pnpm dev
```

Frontend: `http://localhost:5173`

## Build

Frontend build:

```bash
pnpm build
pnpm preview
```

Backend production start:

```bash
cd server
pnpm start
```

## API Overview

Base URL: `${VITE_API_URL}` (default `http://localhost:5001/api`)

Main route groups:
- `/auth`
- `/quizzes`
- `/attempts`
- `/ai`
- `/achievements`
- `/live-sessions`

Health check:
- `GET /api/health`

## Deployment Notes

- Frontend includes `vercel.json` for SPA rewrites.
- Backend includes `server/vercel.json` for serverless deployment.
- Backend writes temporary PDF uploads to `/tmp/testhive-uploads`.

## License

No license file is currently defined in this repository.
