---
name: cloud-agent-starter
description: Practical Cloud agent setup and testing runbook for Aurora
---

# Cloud agent starter (Aurora)

## Trigger

Use this skill at the start of any Cloud-agent coding task in this repo, especially when you need to run the app, validate auth-dependent flows, or test frontend/backend interactions quickly.

## What this repo is

- `frontend/`: primary React + Vite app (served at `http://127.0.0.1:5682`)
- `backend/`: optional Node/Express API + Socket.IO server (served at `http://127.0.0.1:5000`)
- Supabase handles auth/data; many app routes require a valid Supabase session.

## Fast setup (copy/paste)

1. Install dependencies:
   - `npm ci`
   - `npm --prefix frontend ci`
   - `npm --prefix backend ci`
2. Prepare env files:
   - `cp frontend/.env.example frontend/.env`
   - `cp backend/.env.example backend/.env`
3. Set minimum env vars:
   - `frontend/.env`: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, and optionally `VITE_API_BASE_URL`
   - `backend/.env`: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `CLIENT_ORIGIN=http://127.0.0.1:5682`

## Login and session prerequisites

- Routes under `/dashboard` and `/onboarding` require a Supabase-authenticated user.
- Preferred path: create/sign in with a real user via `/sign-up` or `/sign-in` in the running app.
- If auth credentials are unavailable, test only non-auth routes (`/`, `/pricing`, `/sign-in`, `/sign-up`) and backend `/api/ping` checks. Explicitly state auth-gated coverage is blocked.

## Codebase area workflows

### 1) Frontend-only workflow (`frontend/`)

Use when editing UI, routing, client state, or Supabase client behavior.

Run:
- `npm --prefix frontend run dev`
- `npm --prefix frontend run type-check`
- `npm --prefix frontend run lint`
- `npm --prefix frontend run build`

Concrete test workflow:
1. Open `http://127.0.0.1:5682`.
2. Verify public routes load: `/`, `/pricing`, `/sign-in`, `/sign-up`.
3. If valid login is available, sign in and verify `/dashboard` renders.
4. Validate the changed page/flow plus one nearby regression path (for example, dashboard nav + returning to overview).

### 2) Backend/API workflow (`backend/`)

Use when editing `backend/server/**`, API endpoints, auth middleware, or socket behavior.

Run:
- `npm --prefix backend run dev`
- Health check: `curl -sS http://127.0.0.1:5000/api/ping`

Concrete test workflow:
1. Confirm server boot log shows API listening on port `5000`.
2. Verify `/api/ping` returns `{ ok: true, ... }`.
3. For auth-required endpoints (for example `/api/tenants`), test through the frontend with a logged-in user so bearer tokens are attached automatically.
4. If third-party secrets are missing, avoid false failures by testing only paths that do not require those providers.

### 3) Full-stack integration workflow (frontend + backend)

Use when frontend code calls backend endpoints or when realtime/socket behavior is affected.

Run in separate terminals:
- `npm --prefix backend run dev`
- `npm --prefix frontend run dev`

Set in `frontend/.env`:
- `VITE_API_BASE_URL=http://127.0.0.1:5000/api`

Concrete test workflow:
1. Start backend first, then frontend.
2. Sign in through UI.
3. Exercise one end-to-end flow touching changed code (for example tenant list/load, create/update, integrations status).
4. Capture evidence from both browser behavior and terminal logs.

### 4) Third-party and “mock mode” workflow

Use when touching integrations that require external credentials:
- ElevenLabs/Twilio: `ELEVENLABS_API_KEY`, `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER`
- Google Calendar OAuth: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`

Practical strategy:
1. Prefer real credentials only when the task explicitly needs real outbound/integration behavior.
2. Otherwise validate graceful handling paths the code already provides (for example clear 400 responses when keys are missing).
3. Keep local tenant data in “local-*” mode for non-production agent/phone IDs where appropriate.
4. Document what was tested with real creds vs missing-creds fallback.

## Testing checklist by change type

- UI/layout only:
  - `npm --prefix frontend run type-check`
  - `npm --prefix frontend run lint`
  - Manual route/interaction check on changed pages
- Frontend logic/state:
  - `npm --prefix frontend run type-check`
  - `npm --prefix frontend run build`
  - Manual flow validation including one regression path
- Backend/API:
  - `npm --prefix backend run dev`
  - `curl -sS http://127.0.0.1:5000/api/ping`
  - Manual auth flow in frontend for protected endpoints
- Cross-area changes:
  - Run both servers, validate one full happy path and one edge/fallback path

## Common gotchas

- Root `npm run dev` is Windows-specific (`concurrently.cmd`) and can fail on Linux Cloud agents; run frontend/backend scripts directly with `npm --prefix ...`.
- If frontend can’t reach backend locally, set `VITE_API_BASE_URL=http://127.0.0.1:5000/api`.
- Missing Supabase env vars causes auth/client failures early; verify both frontend and backend `.env` files first.
- Backend CORS expects `CLIENT_ORIGIN=http://127.0.0.1:5682` unless intentionally changed.

## How to update this skill (keep it current)

When you discover a new reliable setup/testing trick or runbook step:
1. Add it to the relevant codebase area section above (frontend/backend/integration/third-party).
2. Include exact command(s), required env var names, and when to use the step.
3. Add one “verify success” signal (expected URL, log line, or response snippet).
4. Remove or rewrite stale guidance immediately if scripts/ports/env names changed.
5. Keep this document practical: short, executable steps over architecture prose.
