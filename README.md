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
- Backend should be deployed as a long-running Node service for live Socket.IO sessions.
- A Render blueprint is included at `render.yaml` for the backend service.
- Backend writes temporary PDF uploads to `/tmp/testhive-uploads`.

## Recommended Production Setup

- Frontend: Vercel
- Backend API + Socket.IO: Render
- Database: MongoDB Atlas

This split is recommended for this repo because live sessions use Socket.IO, which needs a persistent server process.

## Deploy Backend To Render

Use the `server/` directory as the backend service.

### Option 1: Deploy with `render.yaml`

1. Push this repo to GitHub.
2. In Render, create a new Blueprint instance from the repo.
3. Render will detect `render.yaml` and create the `testhive-server` web service.
4. Set the secret environment variables in Render:
   - `MONGODB_URI`
   - `JWT_SECRET`
   - `CLIENT_URL`
   - `ANTHROPIC_API_KEY`
5. Deploy the service.

### Option 2: Create the service manually

Create a new Render Web Service with these settings:

- Root Directory: `server`
- Runtime: `Node`
- Build Command: `npm install`
- Start Command: `npm start`
- Health Check Path: `/api/health`

Set these environment variables in Render:

```env
NODE_VERSION=20
PORT=10000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d
CLIENT_URL=https://your-frontend.vercel.app
ANTHROPIC_API_KEY=your_anthropic_api_key
```

Notes:
- Render provides `PORT`; keeping `PORT=10000` in the service config is fine.
- `CLIENT_URL` can be comma-separated if you need multiple frontend origins.
- After the first deploy, your backend base URL will look like `https://your-service-name.onrender.com/api`.
- For live sessions, avoid a sleeping/free instance if possible.

## Deploy Frontend To Vercel

Deploy the repo root as the frontend app.

Use these settings in Vercel:

- Framework Preset: `Vite`
- Root Directory: `.`
- Build Command: `npm run build`
- Output Directory: `dist`

Set these environment variables in Vercel:

```env
VITE_API_URL=https://your-service-name.onrender.com/api
VITE_GOOGLE_CLIENT_ID=your_google_client_id
VITE_MICROSOFT_CLIENT_ID=your_microsoft_client_id
VITE_MICROSOFT_TENANT_ID=your_microsoft_tenant_id
```

Then redeploy the frontend after the backend URL is known.

## Deployment Order

1. Deploy MongoDB and collect the connection string.
2. Deploy the backend to Render.
3. Copy the Render backend URL.
4. Set `VITE_API_URL` in Vercel to `https://your-service.onrender.com/api`.
5. Set `CLIENT_URL` in Render to your Vercel frontend URL.
6. Redeploy both if needed.

## Post-Deploy Checks

Verify these URLs after deployment:

- Backend health: `https://your-service.onrender.com/api/health`
- Frontend loads normally from Vercel
- Login works
- Quiz API calls succeed
- A live session can be created and joined from two browser tabs

## License

No license file is currently defined in this repository.
