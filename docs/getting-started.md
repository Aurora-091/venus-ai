# Getting started (Aurora)

For developers and agents setting up a new machine. **Canonical doc map:** [`docs/README.md`](README.md).

## Prerequisites

- **Node.js** **24.x** (matches [`.github/workflows/ci.yml`](../.github/workflows/ci.yml); use `nvm` or similar if needed)
- **npm** (lockfiles: `frontend/package-lock.json`, `backend/package-lock.json`)
- **Supabase** project (URL + anon key for the browser; service role key only on the server)
- Org access: **GitHub** repo, **Linear** (Invincib1e / `INV`) as needed

## Clone and install

```bash
git clone https://github.com/Aurora-091/venus-ai.git
cd venus-ai
```

### Frontend (Vite + React)

```bash
cd frontend
npm ci
cp .env.example .env
```

Edit `frontend/.env`. Names must match the example file:

| Variable | Purpose |
|----------|---------|
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon (public) key |
| `VITE_API_BASE_URL` | API base path. Use **`/api`** locally so Vite proxies to the backend (see below). |

```bash
npm run dev
```

- **Dev URL:** `http://127.0.0.1:5682` (fixed in `frontend/package.json`)
- **Local API:** With `VITE_API_BASE_URL=/api`, the dev server proxies **`/api`** → `http://127.0.0.1:5000` and **`/socket.io`** → `ws://127.0.0.1:5000` (`frontend/vite.config.ts`). Run the backend on port **5000** for full-stack features.

### Backend (Express + Socket.IO) — optional

Use when you need `/api`, WebSockets, or server-side integrations (Twilio, ElevenLabs, Google, etc.).

New Supabase projects bootstrapped from this repo should run `backend/migrations/20260503_tenant_settings.sql` (or use the updated `backend/supabase_schema.sql`) so the `tenants.settings` column exists for Shopify keys and other Agent Studio JSON config.

```bash
cd backend
npm ci
cp .env.example .env
```

Edit `backend/.env`:

| Variable | Default / notes |
|----------|-----------------|
| `PORT` | **`5000`** (must match the Vite proxy) |
| `CLIENT_ORIGIN` | **`http://127.0.0.1:5682`** (CORS + Socket.IO) |
| `SUPABASE_URL` | Same project URL as the frontend |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key (**server only**; never in Vite env) |
| `ELEVENLABS_API_KEY` | Required for real agent creation / voice paths when used |
| `TWILIO_ACCOUNT_SID` | Required for outbound calls when used |
| `TWILIO_AUTH_TOKEN` | |
| `TWILIO_PHONE_NUMBER` | |
| `GOOGLE_CLIENT_ID` | Optional Google integrations |
| `GOOGLE_CLIENT_SECRET` | |

```bash
npm run dev
```

**Listen address:** `http://127.0.0.1:5000` (API + Socket.IO on the same port).

### Run frontend + backend together

From the **repository root**, do **not** rely on `npm run dev` in the root `package.json` on Linux or macOS (it points at a Windows `concurrently.cmd` path). Use two terminals or one shell with `npx concurrently`, for example:

**Terminal A — backend**

```bash
npm --prefix backend run dev
```

**Terminal B — frontend**

```bash
npm --prefix frontend run dev
```

**One-liner (from repo root, any OS):**

```bash
npx --yes concurrently -k -n backend,frontend -c green,cyan "npm --prefix backend run dev" "npm --prefix frontend run dev"
```

Other root shortcuts that work cross-platform:

| Command | What it does |
|---------|----------------|
| `npm run dev:client` | Frontend only |
| `npm run dev:server` | Backend only |
| `npm run build` | Production build of `frontend/` (same idea as Vercel root build) |
| `npm run check` | `vite build` in `frontend/` (alias for CI-style check) |

## Database schema (Supabase)

Provision tables and RLS in the Supabase SQL editor using the versioned script:

- **`backend/supabase_schema.sql`**

There are no `npm run db:*` scripts in `backend/package.json` today; ignore stale references to them unless they are reintroduced.

## Verify (frontend)

From `frontend/`:

```bash
npm run type-check
npm run lint
npm run build
```

CI runs **Prettier check**, **ESLint**, **type-check**, and **build** on `frontend/` with Node **24.x**.

## User-visible flows to smoke-test

- App loads at `http://127.0.0.1:5682`
- **Supabase Auth** (email/OAuth) matches your project settings if you test login
- With backend running: API routes under `/api` and realtime features that depend on Socket.IO

## Next

- [Workflow](workflow.md) — Linear, Notion, GitHub, Vercel, Supabase  
- [Linear ↔ GitHub](integrations/linear-github.md) — connect the repo  
- [Vercel](integrations/vercel.md) — `frontend/` vs root deploy, env vars on hosting  
- [Architecture](architecture/overview.md) — layout and runtime  
