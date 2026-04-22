# Aurora — engineering workflow

This document describes how **Aurora** uses **Linear**, **Notion**, **GitHub**, **Vercel**, and **Supabase** together. It is optimized for a **small team** (two people) plus **AI agents** (Cursor, Codex): enough structure to stay aligned, not enough to slow you down.

**New to these tools?** Start with [collaboration.md](collaboration.md) (simple loop and rules), then [notion-aurora-hub.md](notion-aurora-hub.md) when you build the Notion workspace.

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

**Optional automation:** A GitHub Action can append one row per **push to `main`** (merge counts) to a **Notion database** — not full generated docs. See [integrations/notion-github-automation.md](integrations/notion-github-automation.md).

## Vercel + Supabase

- Document **which variables** live in Vercel (typically `VITE_*` for the SPA) vs the Supabase dashboard — **names only**, never values in git.
- For each PR: confirm the **Vercel preview URL** and that auth/data paths still work if you touched Supabase-related code.

**Setup:** [integrations/vercel.md](integrations/vercel.md) (import GitHub repo, root vs `frontend` deploy options, previews).

## AI agents (Cursor / Codex)

- Give agents a **Linear issue** with a clear acceptance sentence and optional Notion link for background.
- Keep the human as **reviewer** for merges and for anything touching RLS or production config.

**Project skills (shared prompts):** In this repo, reusable agent “jobs” live under [`.cursor/skills/`](../.cursor/skills/). In Composer, type **`@`** and pick a skill — for example **`cloud-agent-starter`** (env + runbook), **`feature-pr`** (ship a PR), **`issue-investigation`** (triage), **`docs-sync`** (update docs), **`integration-explore`** (spike a third-party integration). One chat ≈ one skill ≈ one task.

## Git branching: `staging` then `main`

Your idea — **merge work somewhere safe first, demo it, only then promote to `main`** — is exactly how many teams avoid a noisy or risky default branch. In industry you will see:

| Pattern | Who uses it | Idea |
|--------|-------------|------|
| **GitHub Flow** | Startups, small teams | Short-lived branches → PR → **`main`**; `main` deploys. Simplest; relies on CI + previews. |
| **Staging branch** | Teams that want a buffer | Feature branches → PR → **`staging`** → integration test / demo → PR **`staging` → `main`**. |
| **Trunk-based** | Larger eng orgs | Very small PRs to **`main`** often; feature flags hide incomplete work. Heavier discipline. |

**Recommendation for Aurora (two people):** use a long-lived **`staging`** branch as your **Trial / integration** line (same idea as “Test first”; we just use a standard name so tools and docs stay clear).

1. **Day-to-day:** `feat/inv-42-…` (or `fix/…`) opens a **PR → `staging`** (not directly to `main`, unless you explicitly choose to).
2. **Integration:** Merge to `staging`, run the app, use **Vercel preview** for that branch if you wire it, confirm the slice works with your teammate.
3. **Promote:** When `staging` is good, open **one PR: `staging` → `main`** (title like `chore: promote staging to main` or list included INV ids). That keeps **`main`** as “we are willing to stand behind this.”

**Hygiene (important):** merge or rebase **`main` → `staging`** regularly so the integration branch does not drift. After a successful promote, **`staging`** should match **`main`** at the tip (merge `main` back into `staging` if needed).

**Hotfixes:** urgent production fixes can go **`fix/…` → `main`** in one PR, then merge **`main` → `staging`** so both lines stay aligned.

**Messiness:** The clutter is usually **many open PRs**, not many branches — keep PRs small, close or merge stale branches, and use Linear for *what* is in flight, not branch names alone.

## Starter epic in Linear

An epic **“Aurora engineering workflow”** and child tasks for Notion setup, GitHub integration, and env/preview documentation may already exist under the **Platform** project — use those as your onboarding checklist.
