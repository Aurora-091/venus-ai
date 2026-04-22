# Aurora Hub on Notion — organize knowledge (and what to copy from this repo)

Use this when you want a **clean Notion workspace** for Aurora without losing the **versioned docs** in Git. **Rule:** Git stays the source of truth for anything that must ship with the code; Notion is the **friendly front door** with links and long-form notes.

---

## Step 1 — Create the hub (15 minutes)

In Notion, create a **top-level page** (or teamspace) named **Aurora**.

Under it, create **empty child pages** with these titles:

| Page | Purpose |
|------|---------|
| **Home** | Only links—no long text (see below). |
| **Engineering** | How we work; can embed or link to GitHub docs. |
| **Runbooks** | Deploy, rollback, incidents (start from templates). |
| **Knowledge** | Imports from `docs/` and team notes. |
| **Specs** | Optional: later, a database of features with Linear links. |

---

## Step 2 — Fill **Home** with links (copy-paste)

Put these on **Home** as a bullet list (adjust URLs if yours differ):

- **Linear:** [https://linear.app/invincib1e](https://linear.app/invincib1e) (your team)
- **GitHub:** [https://github.com/Aurora-091/venus-ai](https://github.com/Aurora-091/venus-ai)
- **Docs (read-only on GitHub):** [docs/README.md on `main`](https://github.com/Aurora-091/venus-ai/blob/main/docs/README.md)
- **Vercel:** your Vercel project dashboard URL
- **Supabase:** your Supabase project dashboard URL
- **Production app:** your live URL when you have one

---

## Step 3 — What to copy from this repo into Notion

**Copy** means: open the file on GitHub, select the parts you need, paste into a Notion page, then add a line at the top: **“Source: venus-ai `docs/…` on `main` (date)”** so you can refresh later.

| Priority | Repo file | Suggested Notion destination | Notes |
|----------|-----------|------------------------------|--------|
| 1 | [collaboration.md](collaboration.md) | **Engineering** → subpage “How we collaborate” | Best for newcomers; keep short |
| 2 | [workflow.md](workflow.md) | **Engineering** → “Tools we use” | Link to GitHub for updates, or paste summary |
| 3 | [integrations/linear-github.md](integrations/linear-github.md) | **Engineering** → “Linear + GitHub” | Paste checklist only |
| 4 | [integrations/vercel.md](integrations/vercel.md) | **Engineering** or **Runbooks** → “Vercel” | Env var *names* only |
| 5 | [getting-started.md](getting-started.md) | **Knowledge** → “Local setup” | |
| 6 | [architecture/overview.md](architecture/overview.md) | **Knowledge** → “Architecture” | Update when stack changes |
| 7 | [operations/runbooks-template.md](operations/runbooks-template.md) | **Runbooks** → duplicate into Deploy / Rollback pages | Fill in owners over time |
| 8 | [knowledge/README.md](knowledge/README.md) | **Knowledge** → “Git vs Notion” | Explains the split |

**Do not delete** these files from the repo after copying—Notion is a mirror for reading, not a replacement for version control.

---

## Step 4 — What usually stays **only** in Git

- **`.github/`** templates (PR / issues)
- **CI** definitions (`.github/workflows/`)
- **Exact** `vercel.json` / build config
- Anything that must change in the **same PR** as code

Link to them from Notion instead of duplicating YAML.

---

## Step 5 — Optional files (older / design)

| File | Action |
|------|--------|
| [design.md](design.md) | Copy **summary** to Notion **Design** page if you still use these tokens |
| [task.md](task.md) | **Do not** treat as backlog—use **Linear**; optionally archive a snapshot in Notion **Archive** |

---

## Step 5b — Automatic log on `main` (optional)

After you add Notion integration secrets in GitHub, each **push to `main`** adds **one row** (HEAD commit) to a **database** — no PR-open noise. See [integrations/notion-github-automation.md](integrations/notion-github-automation.md).

---

## Step 6 — Connect Notion ↔ Linear (in Notion)

In **Notion Settings → Connections**, add **Linear** if available. Then you can `@`-mention Linear issues from Notion pages and search across both (depending on your Notion plan).

---

## Checklist

- [-] **Aurora** parent page exists with **Home** + **Engineering** + **Runbooks** + **Knowledge**
- [-] **Home** has links to Linear, GitHub, Vercel, Supabase, prod URL
- [ ] At least **collaboration** + **workflow** content is summarized or linked
- [-] Team agrees: **Linear** = tasks, **Notion** = narrative, **GitHub** = code
- [-] Optional: [Notion `main` push log](integrations/notion-github-automation.md) (GitHub Actions + database)

---

## Related

- [collaboration.md](collaboration.md) — daily habits
- [workflow.md](workflow.md) — tool roles
- [README.md](README.md) — doc map
