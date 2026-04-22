---
name: docs-sync
description: >-
  After behavior or env changes, update one canonical doc so humans and agents
  can run the project. Use post-merge or when setup drifts.
---

# Documentation synchronization

## Trigger

Setup, env vars, ports, or a user-visible flow **changed** and **docs are stale** — or user explicitly wants docs aligned with code.

## Rules

1. **Single source** — Canonical long-form docs live in **Notion** (Aurora **Engineering docs** library). Update the right child page there; the repo only keeps `docs/README.md` as a pointer to the wiki.
2. **Be executable** — Commands, env var **names**, ports, URLs; remove dead steps in Notion.
3. **Repo** — Change `CONTRIBUTING.md` or `README.md` only when the *pointer* or contributor gates change — not to duplicate the wiki.
4. **Scope** — Doc-only unless code is wrong; then minimal code fix if the user wants.
5. **Stop** when the relevant Notion page is accurate.

## Where to look first

- Notion: **Engineering docs (canonical)** → pick the page that matches the change (workflow, integrations, getting started, …).
- Env examples (still in repo): `frontend/.env.example`, `backend/.env.example`

## Verification

- Re-read changed sections as if onboarding a new teammate in 10 minutes.
