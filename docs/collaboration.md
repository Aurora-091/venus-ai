# How we work together: Linear, GitHub, and Notion (beginner-friendly)

This page is for anyone new to **Linear**, **Notion**, or **GitHub** in a small team. You do not need to be an expert—follow the loop below and you will stay aligned.

---

## What each tool is for (one paragraph each)

**Linear** is your **task board**. It answers: *What are we building? Who is doing it? Is it done?* Every meaningful piece of work should have a **Linear issue** (for example **`INV-42`**). Linear is **not** for long documents—that is what Notion is for.

**GitHub** is where the **code** lives and where **pull requests (PRs)** are reviewed. When you finish a task, you open a PR. The PR should **mention the Linear issue** so people can jump between code and the task.

**Notion** is your **wiki and links home**. It answers: *Why did we decide this? Where are the runbooks? Where is the link to Vercel?* Notion is **not** a second task list—do **not** duplicate every Linear issue in Notion.

---

## The simple loop (sync repo ↔ Linear)

1. **Create or pick an issue in Linear** (team **Invincib1e**, id like **`INV-123`**).
2. **Create a branch** (from Linear’s “Copy branch name” if you use it, or name it `feat/inv-123-short-description`).
3. **Commit and push**, then open a **pull request** on GitHub to **`main`** (or your default branch).
4. Put **`INV-123`** in the **PR title** or **description** so GitHub and Linear stay linked (especially if you use the [GitHub integration](integrations/linear-github.md)).
5. **Review and merge**. Move the Linear issue to **Done** when the work is actually finished (or let automation do it if you enabled it).
6. **Paste the Vercel preview URL** on the PR when the change is user-visible.

That is the **sync**: one issue in Linear, one PR in GitHub, same id in both places.

---

## Rules so nothing drifts

| Do | Don’t |
|----|--------|
| Put **`INV-___`** in PR titles when the work maps to an issue | Open “mystery” PRs with no issue when the work was planned |
| Keep **long specs** in Notion; link the Notion page **from the Linear issue** | Copy the whole backlog into Notion |
| Use **GitHub** for code review and CI | Use Notion comments for code review |
| Update **docs in the repo** when the *process* or *architecture* changes | Rely only on chat history |

---

## Working with a teammate (two people)

- **Ownership:** Assign the Linear issue to **one** owner when someone is clearly driving it.
- **Handoff:** Write 2–3 sentences in the Linear issue when you stop and someone else continues.
- **Short sync:** Once a week, 10–15 minutes: what is in progress, what is blocked. Blockers go in Linear with a **Blocked** label or a comment.
- **Notion:** Use a single **Aurora Home** page with links (Linear, GitHub, Vercel, Supabase)—see [notion-aurora-hub.md](notion-aurora-hub.md).

---

## How AI helpers (Cursor / Codex) fit in

- Give them a **Linear issue** with a clear **“done when…”** line.
- Paste a **Notion spec link** in the issue if the background is long.
- **Humans** still review merges, especially for **auth**, **database**, and **production** settings.

---

## Where to read more

| Topic | Doc |
|--------|-----|
| Full tool map | [workflow.md](workflow.md) |
| Linear ↔ GitHub | [integrations/linear-github.md](integrations/linear-github.md) |
| Vercel | [integrations/vercel.md](integrations/vercel.md) |
| Building the Notion hub + copying repo docs | [notion-aurora-hub.md](notion-aurora-hub.md) |
