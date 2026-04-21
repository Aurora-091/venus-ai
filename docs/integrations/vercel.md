# Vercel: connect repo and enable previews (Aurora)

The UI lives in **`frontend/`** (Vite). Point the Vercel project at that folder so builds do not run from the monorepo root by mistake.

**Repository:** [Aurora-091/venus-ai](https://github.com/Aurora-091/venus-ai)

---

## 1. Import the GitHub repository

1. Open [Vercel Dashboard](https://vercel.com/dashboard) → **Add New…** → **Project**.
2. **Import** [Aurora-091/venus-ai](https://github.com/Aurora-091/venus-ai).  
   - If the org does not appear, install the Vercel GitHub App for **Aurora-091** and grant access to this repo.
3. Before deploying, open **Configure Project** (or **Settings** after import).

---

## 2. Root directory and build

**Default (current):** The repo has a root [`vercel.json`](https://github.com/Aurora-091/venus-ai/blob/main/vercel.json) so deployments that use the **repository root** install both root + `frontend` dependencies and build with `npm run build --prefix frontend`. Leave **Root Directory** empty / `.` in the Vercel project if you rely on this.

**Alternative:** Set **Root Directory** to `frontend` only. Then Vercel ignores the root `vercel.json` and uses [`frontend/vercel.json`](https://github.com/Aurora-091/venus-ai/blob/main/frontend/vercel.json) (Vite, `dist`, SPA rewrites). Root `npm install` is not used in that mode.

| Setting | Root deploy (`.`) | Subfolder deploy (`frontend`) |
|--------|---------------------|-------------------------------|
| **Install** | See root `vercel.json` `installCommand` | `npm ci` in `frontend/` |
| **Build** | `npm run build --prefix frontend` | `npm run build` |
| **Output** | `frontend/dist` | `dist` |

---

## 3. Environment variables

In the project → **Settings** → **Environment Variables**, add (names from [`frontend/.env.example`](https://github.com/Aurora-091/venus-ai/blob/main/frontend/.env.example)):

| Name | Production | Preview | Development |
|------|------------|---------|---------------|
| `VITE_SUPABASE_URL` | Your Supabase project URL | Same or a **staging** Supabase URL | Optional |
| `VITE_SUPABASE_ANON_KEY` | Anon key | Staging anon key if you use a separate project | Optional |
| `VITE_API_BASE_URL` | `/api` or your deployed API base URL | Same as prod or staging API | `/api` |

Enable **Preview** and **Production** (and Development if you use `vercel dev`) for each variable as appropriate.

Redeploy after changing env vars.

---

## 4. Enable preview deployments (PR previews)

Previews are **on by default** when the project is connected to GitHub.

1. **Settings** → **Git**:
   - Confirm the linked repository is **Aurora-091/venus-ai**.
   - **Production Branch** is usually `main` (adjust if your default branch differs).
2. **Preview Branches**: leave **All branches** (or restrict if your org policy requires it).
3. Optional: enable **Comments** / **Commit status** so GitHub shows preview links on pull requests.

Open a test PR targeting `main`; you should see a **Preview** deployment and a unique `*.vercel.app` URL on the PR.

---

## 5. Production domain

After the first successful deploy: **Settings** → **Domains** — add your custom domain when ready.

---

## 6. Verify

- [ ] A push to `main` creates a **Production** deployment.
- [ ] A PR creates a **Preview** deployment with a working app (check Supabase keys for that environment).
- [ ] Client-side routes (e.g. dashboard URLs) load on refresh — helped by `rewrites` in `frontend/vercel.json`.

---

## Troubleshooting

| Issue | What to check |
|--------|----------------|
| Build runs at repo root | **Root Directory** must be `frontend`. |
| Blank page on refresh | Ensure `vercel.json` `rewrites` are present and redeploy. |
| Wrong API URL on preview | Set `VITE_API_BASE_URL` per environment in Vercel. |
| Env not applied | Scope variables to Preview vs Production; trigger a new deployment. |

## Related

- [Workflow (tools)](../workflow.md) — Vercel in the stack  
- [Getting started](../getting-started.md) — local `VITE_*` vars  
