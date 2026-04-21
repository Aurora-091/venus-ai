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

### 2. Create the database (exact property names)

In Notion, create a **database**. Add these properties **with these names** (case-sensitive):

| Property name | Type |
|---------------|------|
| **Name** | Title |
| **PR** | URL *(stores the **commit** link on `main` pushes — name is legacy; still a URL)* |
| **Updated** | Date |

Share the database with your integration: **⋯** → **Connections** → add the integration.

Copy the **database ID** from the Notion URL (32-character id in the path). Use as **`NOTION_DATABASE_ID`**.

If you rename properties, use repository **Variables** or env in the workflow:

- `NOTION_PROP_NAME` (default `Name`)
- `NOTION_PROP_LINK` (default `PR`)
- `NOTION_PROP_UPDATED` (default `Updated`)

### 3. Add GitHub secrets

In **GitHub** → **Aurora-091/venus-ai** → **Settings** → **Secrets and variables** → **Actions**:

| Secret | Value |
|--------|--------|
| `NOTION_TOKEN` | Internal integration secret |
| `NOTION_DATABASE_ID` | Database UUID |

Do **not** commit these to the repo.

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
