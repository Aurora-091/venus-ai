# Knowledge base (Aurora)

You are building documentation **from scratch**. Use this split so nothing duplicates and agents always have a clear place to look.

## Principles

| Location | Put here |
|----------|-----------|
| **This repo (`docs/`)** | Things that must version with code: architecture boundaries, env var *names*, runbook steps tied to releases, ADRs that affect implementation |
| **Notion** | Long-form specs, meeting notes, stakeholder context, **links hub** (one page listing Linear, GitHub, Vercel, Supabase URLs) |
| **Linear** | Tasks, acceptance criteria, *short* context in the issue body |

**Do not** maintain two parallel backlogs (Notion tasks + Linear). **Linear owns execution.**

---

## Suggested Notion structure (create empty, then fill)

Create a workspace or top-level page **Aurora** with children:

1. **Home** — Bullet list of links only: Linear team, [github.com/Aurora-091/venus-ai](https://github.com/Aurora-091/venus-ai), Vercel project, Supabase project, production URL(s).
2. **Engineering** — Link to the docs hub: [github.com/Aurora-091/venus-ai/blob/main/docs/README.md](https://github.com/Aurora-091/venus-ai/blob/main/docs/README.md), plus 5 bullets: branch naming, PR process, on-call (TBD).
3. **Specs** — One page per major feature OR a simple database: Title | Owner | Linear link | Status | Figma link.
4. **Runbooks** — One page each: Deploy, Rollback, Env vars overview (names only), Incident checklist.
5. **Decisions** — Short ADR-style pages: Problem → Decision → Consequences (optional).

Invite the second teammate as **full** or **edit** as needed.

---

## Suggested git documentation (this repo)

Grow these files as you learn:

| File | When to update |
|------|------------------|
| `docs/knowledge/voice-engine-positioning.md` | When MVP engine choice or competitor story changes |
| `docs/architecture/overview.md` | When stack or boundaries change |
| `docs/operations/runbooks-template.md` | First time you deploy or cut over prod |
| `docs/integrations/linear-github.md` | If integration steps change |

---

## Connect Notion ↔ Linear (in Notion)

In **Notion Settings** → **Connections** (or **Integrations**):

- Add **Linear** if listed, and authorize.
- That lets you **mention or embed** Linear issues in Notion pages and improves cross-search for teams on Notion AI plans.

This is configured in **Notion**, not in git.

---

## Agents (Cursor / Codex)

Give an agent:

1. A **Linear issue** with a one-line **definition of done**
2. An optional **Notion** spec URL for background
3. Pointers to **`docs/`** when changing architecture

Review all PRs that touch **RLS**, **auth**, or **production env**.
