# Aurora documentation

**Canonical repository:** [https://github.com/Aurora-091/venus-ai](https://github.com/Aurora-091/venus-ai)

This folder is the **source-of-truth map** for engineers and agents. It starts minimal and grows with the product.

| Doc | Purpose |
|-----|---------|
| [Roadmap](roadmap.md) | North star, Seed ready vs Customer ready, phased plan |
| [Getting started](getting-started.md) | Clone, install, env vars, run locally |
| [Collaboration (beginners)](collaboration.md) | Linear ↔ GitHub ↔ Notion loop, working with teammates |
| [Notion Aurora Hub](notion-aurora-hub.md) | Build the wiki, copy repo docs into Notion, checklists |
| [Workflow (tools)](workflow.md) | How Linear, Notion, GitHub, Vercel, Supabase fit together |
| [Linear ↔ GitHub](integrations/linear-github.md) | Connect the repo to Linear; branch and PR conventions |
| [Vercel](integrations/vercel.md) | Import repo, `frontend` root, env vars, preview deployments |
| [Notion ↔ GitHub automation](integrations/notion-github-automation.md) | One Notion row per **push to `main`** (Actions + secrets) |
| [Knowledge base](knowledge/README.md) | What lives in git vs Notion; how to grow docs |
| [Voice engine positioning](knowledge/voice-engine-positioning.md) | ElevenLabs vs Vapi vs competitors; MVP “not a wrapper” definition |
| [Architecture overview](architecture/overview.md) | Repo layout, runtime picture, stack |
| [Runbooks template](operations/runbooks-template.md) | Checklist for deploy / rollback / incidents (fill in) |

## Project files elsewhere

- [../CONTRIBUTING.md](../CONTRIBUTING.md) — PRs, `INV` issues, reviews
- [../.github/PULL_REQUEST_TEMPLATE.md](../.github/PULL_REQUEST_TEMPLATE.md) — PR body

## Older notes in repo

| File | Notes |
|------|--------|
| [design.md](design.md) | VoiceOS-era design tokens (reuse or merge into current Aurora UI docs) |
| [task.md](task.md) | Historical build checklist — not the live backlog (use **Linear**) |

## Conventions

- **Linear issue IDs** use team key **`INV`** (e.g. `INV-42`).
- **Specs** that are short stay in Linear; longer write-ups go to **Notion** with the issue linked at the top.
- **Secrets** never go in this repo—only variable *names* in docs when needed.
