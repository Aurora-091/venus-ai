# Aurora MERN App

React + Vite frontend, Express + MongoDB backend, Recoil client state, and Socket.IO realtime events.

## Structure

- `frontend/` - React + Vite app, routes, UI, Recoil state, and static assets
- `frontend/package.json` - frontend-only dependencies and scripts
- `backend/server/` - Express API, Mongoose models, and Socket.IO server
- `backend/api/` - legacy Cloudflare/Hono API, D1 schema, and migrations
- `backend/package.json` - backend-only dependencies and scripts
- `docs/` - project notes and planning docs

Local development runs the MERN backend from `backend/server/` and the Vite frontend from `frontend/`.

## Quick Start

```bash
npm --prefix frontend install
npm --prefix backend install
npm run dev
```

Frontend: `http://127.0.0.1:5682`

Backend API: `http://127.0.0.1:5000/api`

Socket.IO: `ws://127.0.0.1:5000`

## Outbound Calls

Outbound calls are real only when the backend has:

```bash
ELEVENLABS_API_KEY=...
TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=...
```

and the tenant has a real ElevenLabs `agentId` plus `phoneNumberId`. Demo values like `local-agent-*` are ignored because ElevenLabs cannot load them.

## Environment

Environment files are split by app:

- `frontend/.env` - browser-safe Vite values only
- `backend/.env` - server secrets and integration keys

Copy each example if you need to recreate them:

```bash
cp frontend/.env.example frontend/.env
cp backend/.env.example backend/.env
```

Set `MONGODB_URI` in `backend/.env` for persistent data:

```bash
MONGODB_URI=mongodb://127.0.0.1:27017/aurora_test_0093
```

If `MONGODB_URI` is missing or MongoDB is unavailable, the backend starts with in-memory demo data so the frontend can still be used.

Demo login for the in-memory store:

```text
demo@voiceos.ai
demo1234
```

## Scripts

```bash
npm run dev          # backend + frontend
npm run dev:server   # Express, MongoDB, Socket.IO from backend/server
npm run dev:client   # Vite React app from frontend
npm run build        # frontend production build
npm run check        # build verification
```

You can also run each package directly:

```bash
npm --prefix frontend run dev
npm --prefix backend run dev
```

## Realtime Flow

The frontend connects to Socket.IO through Vite's `/socket.io` proxy. When a tenant is active, the client joins that tenant room. Backend events such as `tenant:created`, `tenant:updated`, and `call:created` update Recoil atoms in `frontend/src/state/appState.ts`.

## Tailwind

This project uses Tailwind CSS v4 through `@tailwindcss/vite`. Keep styling configuration CSS-first in `frontend/src/styles.css`.
