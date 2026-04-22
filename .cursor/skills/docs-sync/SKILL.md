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

1. **Single source** — Prefer updating existing files under `docs/` or `CONTRIBUTING.md` over new long pages.
2. **Be executable** — Commands, env var **names**, ports, URLs; remove dead steps.
3. **Notion** — At most **3 bullets** for the team hub if they mirror repo truth; do not duplicate the Linear backlog here.
4. **Scope** — Doc-only unless a sentence proves code is wrong; then minimal code fix + doc in same PR if user wants.
5. **Stop** when one coherent doc path is accurate; do not rewrite the whole wiki.

## Where to look first

- `docs/README.md`, `docs/collaboration.md`, `docs/workflow.md`
- Integration docs: `docs/integrations/`
- Env examples: `frontend/.env.example`, `backend/.env.example`

## Verification

- Re-read changed sections as if onboarding a new teammate in 10 minutes.
