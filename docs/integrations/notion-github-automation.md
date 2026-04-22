# Notion ↔ GitHub: automatic log on **push to `main`**

**What this does:** After each **`git push` to `main`** (including when you **merge a PR** into `main`), GitHub Actions adds **one row** to a Notion database with the **HEAD commit** message, commit URL, and date.

**What this does *not* do:** It does **not** run on PR open/sync/close — only when code lands on **`main`**, so Notion stays uncluttered.

**What this does *not* do:** It does **not** auto-write architecture docs. That would need a separate pipeline (e.g. LLM). This is a **compact activity log**.

---

## One-time setup (about 15 minutes)

### 1. Create a Notion integration

1. Open [My integrations](https://www.notion.so/my-integrations) → **New integration**.
2. Name it (e.g. `Aurora GitHub main log`), associate with your workspace.
3. Under **Capabilities**, enable **Read content** and **Insert content** (create pages / database rows).
4. Copy the **Internal Integration Secret** — use it as **`NOTION_TOKEN`** in GitHub.

### 2. Create the database (schema the script expects)

The automation works with the **Commits** database shape (you can rename the database, but keep these properties unless you override env vars):

| Property name | Type | Filled by Actions |
|---------------|------|-------------------|
| **Name** | Title | `[main] &lt;sha&gt;: first line of commit` |
| **PR** | URL | GitHub **commit** URL (column name is legacy) |
| **Updated** | Date | Commit date |
| **Branch** | Select | Always **`main`** (override with `NOTION_BRANCH_NAME`) |
| **Status** | Status | **`Merged`** by default (override with `NOTION_STATUS_NAME`) |
| **Author** | People | **Left empty** — GitHub accounts are not Notion users. Do **not** require this property for new rows. |

Share the database with your integration: **⋯** → **Connections** → add the integration.

**`NOTION_DATABASE_ID` in GitHub:** use only the database UUID from the Notion URL, **without** `?v=…` (that part is a **view** id, not the database).

Example: from `https://www.notion.so/34a14fb3db3080c6b961d7c7f6acd635?v=…` use **`34a14fb3db3080c6b961d7c7f6acd635`** or the dashed form — the script normalizes either.

If you rename properties, set repository **Variables** or env in the workflow:

- `NOTION_PROP_NAME` (default `Name`)
- `NOTION_PROP_LINK` (default `PR`)
- `NOTION_PROP_UPDATED` (default `Updated`)
- `NOTION_PROP_BRANCH` (default `Branch`)
- `NOTION_PROP_STATUS` (default `Status`)

**Security:** Never paste the Notion token in chat, issues, or commits. If it was exposed, **revoke** it in Notion and create a new secret; update **`NOTION_TOKEN`** in GitHub Actions only.

### 3. Add GitHub secrets

**Option A — use the repo script (recommended, stays on your machine)**

1. [Install GitHub CLI](https://cli.github.com/) and run `gh auth login` if you have not already.
2. In PowerShell, from the repository root:

   ```powershell
   pwsh -File scripts/set-github-secrets.ps1
   ```

3. When prompted, paste the **Notion internal integration token** and the **database id** (no `?v=`). Nothing is written into git or into chat.

You must be allowed to manage secrets on **Aurora-091/venus-ai** (e.g. admin or “secrets” access). If you get **HTTP 403**, ask an org owner to add you or to set the secrets for you.

**Option B — GitHub website**

1. **GitHub** → [Aurora-091/venus-ai](https://github.com/Aurora-091/venus-ai) → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**  
2. Add:

| Name | Value |
|------|--------|
| `NOTION_TOKEN` | Internal integration secret from Notion |
| `NOTION_DATABASE_ID` | Database UUID only (no `?v=…`) |

Do **not** commit secrets to the repo. Do **not** paste them into issues or AI chats.

### 4. Merge the workflow to `main`

Ensure `.github/workflows/notion-pr-sync.yml` and `scripts/notion-pr-sync.mjs` are on **`main`**.

---

## Behavior

| When | Row in **Name** |
|------|------------------|
| Push (or merge) updates `main` | `[main] abc1234: First line of commit message` |
| **Link** column | URL of that commit on GitHub |

**One row per push** to `main` (the tip commit). A batch push with many commits still produces **one** row (HEAD only).

### Skip Notion for a commit

Put **`[skip notion]`** or **`[notion skip]`** at the **start** of the commit message (e.g. empty chore). The workflow still runs but the script exits without creating a row.

---

## How to test

1. Secrets and database are set up as above.
2. Merge your workflow to **`main`** (or push it directly).
3. Make a small change on a branch → open PR → **merge to `main`** (or push to `main` directly).
4. Open **Actions** → **Notion main push log** → confirm success.
5. Open the Notion database → confirm a new row with the latest commit.

Opening a **draft PR only** does **not** log to Notion until it is merged to `main`.

---

## Related

- [notion-aurora-hub.md](../notion-aurora-hub.md) — manual hub + copying docs  
- [collaboration.md](../collaboration.md) — Linear + GitHub habits  
