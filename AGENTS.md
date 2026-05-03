# AGENTS.md

## Cursor Cloud specific instructions

### Overview

Aurora is a SaaS platform for AI-powered voice agents. The repo has two projects:

- **`frontend/`** — React + Vite (TypeScript), served at `http://127.0.0.1:5682`
- **`backend/`** — Express + Socket.IO (JavaScript/ESM), served at `http://127.0.0.1:5000`

Supabase provides auth, database, and realtime. See `docs/getting-started.md` for full setup details.

### Node.js version

Node.js **24.x** is required (matches CI in `.github/workflows/ci.yml`).

### Package manager

**npm** — lockfiles live at `frontend/package-lock.json` and `backend/package-lock.json`. The root `package-lock.json` only covers the `husky` dev dependency.

### Running services

Root `npm run dev` uses a **Windows-only** `concurrently.cmd` path. On Linux, start each service separately:

```bash
npm --prefix backend run dev    # backend on :5000
npm --prefix frontend run dev   # frontend on :5682
```

The Vite dev server proxies `/api` and `/socket.io` to the backend (`vite.config.ts`).

### Environment files

Copy `.env.example` files in both `frontend/` and `backend/` and populate with secrets injected as environment variables (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`).

### CI checks (frontend only)

```bash
npm --prefix frontend run lint        # ESLint
npm --prefix frontend run type-check  # tsc --noEmit
npm --prefix frontend run build       # Vite production build
npx --prefix frontend prettier --check "src/**/*.{js,jsx,ts,tsx,css,md}"  # Prettier
```

### Pre-commit hook

`.husky/pre-commit` runs `lint-staged` in `frontend/`, which auto-formats staged files with Prettier.

### Backend health check

```bash
curl -sS http://127.0.0.1:5000/api/ping
# Expected: {"ok":true,"stack":"mern","ts":...}
```

### Auth-gated routes

Routes under `/dashboard` and `/onboarding` require a Supabase-authenticated user. Public routes (`/`, `/pricing`, `/sign-in`, `/sign-up`) work without auth. If no test login credentials are available, test only public routes and backend `/api/ping`.
