# Aurora — engineering workflow

This document describes how **Aurora** uses **Linear**, **Notion**, **GitHub**, **Vercel**, and **Supabase** together. It is optimized for a **small team** (two people) plus **AI agents** (Cursor, Codex): enough structure to stay aligned, not enough to slow you down.

## Roles of each tool

| Tool | Owns |
|------|------|
| **Linear** | Backlog, priorities, cycles, and *what ships*. Single source of truth for tasks. |
| **Notion** | Narrative context: specs, runbooks, ADRs, meeting notes. *Not* a duplicate task list. |
| **GitHub** | Code, pull requests, CI, and review. |
| **Vercel** | Frontend hosting, preview deployments per PR, environment variables for the app. |
| **Supabase** | Auth, Postgres, RLS, Realtime, and project settings in the Supabase dashboard. |

## Linear workspace

- **Team:** Invincib1e (Linear team key: **`INV`** — issue IDs look like `INV-123`).
- **Projects:** Platform · Product · Supabase · Ops & incidents (group work by theme).
- **Labels:** `area: frontend`, `area: backend`, `area: supabase`, `type: chore`, `platform: vercel`, plus workspace labels Bug / Feature / Improvement.

Create work in Linear first, then branch and open a PR that references the issue.

## GitHub ↔ Linear

1. In Linear: **Settings → Integrations → GitHub** — connect the org repository that hosts Aurora.
2. Prefer **PR titles** that include the issue id, e.g. `INV-42 Add booking export`.
3. Use **branch names** that match Linear when helpful, e.g. `feat/inv-42-booking-export` (Linear can suggest a branch from an issue).

**Step-by-step:** see [integrations/linear-github.md](integrations/linear-github.md).

## Notion (recommended layout)

Create a small **Aurora** space:

1. **Home** — Bookmark links: Linear, this GitHub repo, Vercel project, Supabase project, production URL.
2. **Engineering** — Short notes: branch naming, PR checklist, who updates Vercel vs Supabase settings.
3. **Runbooks** — Deploy, rollback, key rotation, incident checklist (expand as needed).
4. **Specs** (optional database) — Title, owner, link to Linear issue, link to design.

**Rule:** If it fits in one Linear issue description, keep it there. Use Notion when you need a longer spec or a durable runbook.

## Vercel + Supabase

- Document **which variables** live in Vercel (typically `VITE_*` for the SPA) vs the Supabase dashboard — **names only**, never values in git.
- For each PR: confirm the **Vercel preview URL** and that auth/data paths still work if you touched Supabase-related code.

## AI agents (Cursor / Codex)

- Give agents a **Linear issue** with a clear acceptance sentence and optional Notion link for background.
- Keep the human as **reviewer** for merges and for anything touching RLS or production config.

## Starter epic in Linear

An epic **“Aurora engineering workflow”** and child tasks for Notion setup, GitHub integration, and env/preview documentation may already exist under the **Platform** project — use those as your onboarding checklist.
