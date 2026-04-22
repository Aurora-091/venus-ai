# Architecture overview (Aurora)

High-level map. Update this file when the stack or repo layout changes.

## Product shape

- **SPA:** React + Vite under `frontend/`
- **Backend services:** Primary persistence and auth through **Supabase** (Postgres, Auth, Realtime as used by the app)
- **Hosting:** **Vercel** for the frontend (environment variables for build/runtime)
- **Optional server:** `backend/` may run Node (Express, Socket.IO) for auxiliary APIs or realtime bridges—confirm what is deployed in production for your deployment; not every feature may use it

## Request path (typical)

1. User loads the Vercel-hosted SPA.
2. The browser talks to **Supabase** via `@supabase/supabase-js` for auth, database, and realtime channels as implemented.
3. Any separate HTTP/socket services depend on how you configure and deploy `backend/` (document your actual deployment when known).

## Repository layout (conceptual)

```
venus-ai/
├── frontend/          # Main UI — Vite, React, Tailwind v4, Recoil
├── backend/           # Optional Node server (if used in your environment)
├── docs/              # This documentation set
└── .github/           # CI, PR template, issue templates
```

## Environments

| Environment | Role |
|-------------|------|
| **Local** | `frontend/.env` — Supabase URL + anon key; never commit secrets |
| **Vercel Preview** | Per-PR builds; validate UI and API calls against a dev/staging Supabase if you use one |
| **Vercel Production** | Production Supabase project and domains |

Document **which Supabase project** maps to preview vs production in Notion or in this doc when you finalize it.

## CI

GitHub Actions (see `.github/workflows/ci.yml`) runs install, format check, lint, typecheck, and build for the frontend on pushes and PRs to `main`.

## Future additions

When you add topics worth a dedicated page:

- Data model and RLS overview (link to migrations / Supabase SQL)
- Third-party integrations (Google APIs, etc.) as implemented in `backend/` or Edge Functions
