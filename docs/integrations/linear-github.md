# Connect Linear to the GitHub repository

**Canonical repo:** [Aurora-091/venus-ai](https://github.com/Aurora-091/venus-ai)

Use this when you are **starting from scratch**: no GitHub link in Linear yet, or you moved the repo to a new org.

## What you get after connecting

- Open a **Linear issue** → create a **branch name** / **copy** that includes `INV-123`
- **Pull requests** on GitHub can **link** to Linear issues (and optionally move status when merged—depends on your Linear automation settings)
- Developers see **repo activity** next to engineering work in one place

Linear’s UI changes occasionally; if a label differs, use **Settings → Integrations** and search for **GitHub**.

---

## Step 1 — GitHub side (org or repo access)

1. Ensure repositories live under your **GitHub organization** (e.g. `Aurora-091/venus-ai`).
2. Decide which repos Linear may access: usually **only the Aurora app repo** (least privilege).

You must have **admin** or sufficient rights on the org/repo to install GitHub Apps for the org.

---

## Step 2 — Linear: install the GitHub integration

1. Open **Linear** in the browser.
2. Go to **Settings** (workspace or your profile, depending on plan).
3. Open **Integrations** (or **Workspace → Integrations**).
4. Find **GitHub** and choose **Connect** / **Add**.
5. Complete OAuth and select the **organization** and **repositories** (e.g. `venus-ai`).
6. Save.

If Linear asks for a **Personal Access Token** in older flows, prefer the **GitHub App** integration when offered—it is easier to scope per repo.

---

## Step 3 — Map the Aurora repo (automation)

Still under the GitHub integration in Linear:

1. Confirm the **`Aurora-091/venus-ai`** repo appears in the list.
2. Enable options that match how you want to work, for example:
   - **Link PRs** when the title or branch contains `INV-` / issue URL
   - **Auto-assign** or **move to In Progress** when a branch is created (optional)
   - **Done** when PR merges to default branch (optional—popular for small teams)

Exact toggles vary; pick **minimal automation** first, then add more once the team agrees.

---

## Step 4 — Team conventions (align with this repo)

- **Issue prefix:** `INV` (team **Invincib1e**).
- **PR title example:** `INV-12 Add pricing page` or `[INV-12] Add pricing page`
- **Branch example:** `feat/inv-12-pricing-page` (from Linear’s “Copy git branch name” when available)

Our [PR template](../../.github/PULL_REQUEST_TEMPLATE.md) asks for the **`INV-___`** line—keep that habit.

---

## Step 5 — Verify end-to end

1. Create a **test issue** in Linear (or use a small real task).
2. In Linear, use **Copy branch name** (if available) and create a branch locally, commit a trivial doc fix, open a **PR** to `main`.
3. Confirm the **PR shows the Linear link** in GitHub or Linear (depending on integration).
4. Merge the PR; confirm the issue **moves to Done** if you enabled that automation.

Delete the test issue or close it cleanly.

---

## Troubleshooting

| Problem | What to try |
|---------|----------------|
| Linear cannot see the org | Re-authorize GitHub; check org **Third-party access** / **OAuth app** restrictions |
| PR does not link | Put `INV-123` in the **PR title** or **description**; ensure repo is selected in Linear |
| Wrong repo connected | Linear → GitHub integration → adjust repository list |
| Fork vs org repo | Connect the **canonical org repo**, not a personal fork, for production work |

---

## Related

- [Workflow (tools)](../workflow.md) — full tool chain  
- [Contributing](../../CONTRIBUTING.md) — PR checklist  
