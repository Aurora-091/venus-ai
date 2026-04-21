# Getting started (Aurora)

For developers joining the repo or setting up a new machine.

## Prerequisites

- **Node.js** 20.x (matches CI; see `.github/workflows/ci.yml`)
- **npm** (lockfiles are committed under `frontend/` and `backend/` as applicable)
- Access to **Supabase** (project URL + anon key for local dev)
- Access to **GitHub** org/repo and **Linear** (Invincib1e / `INV`)

## Clone and install

```bash
git clone https://github.com/Aurora-091/venus-ai.git
cd venus-ai
```

Frontend (primary app):

```bash
cd frontend
npm ci
cp .env.example .env
```

Edit `frontend/.env` with your Supabase values:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

## Run the app

From `frontend/`:

```bash
npm run dev
```

Default dev URL: `http://127.0.0.1:5682` (see `frontend/package.json`).

## Monorepo scripts (repo root)

From the repository root, `package.json` may define shortcuts such as `npm run dev` running both frontend and backend. If you only need the UI, working in `frontend/` is enough.

## Verify

- [ ] `npm run type-check` (from `frontend/`) passes
- [ ] `npm run build` (from `frontend/`) passes
- [ ] App loads and auth flows match your Supabase project if you test login

## Next

- [Workflow](workflow.md) — how we use Linear and PRs  
- [Linear ↔ GitHub](integrations/linear-github.md) — connect your GitHub repo  
- [Architecture](architecture/overview.md) — where code and services live  
