---
name: feature-pr
description: >-
  Turn finished work into a small, reviewable GitHub PR with Linear INV-___
  linkage and the right checks. Use when code works locally and you need to ship.
---

# Feature pull request (Ship)

## Trigger

User is ready to **open or polish a PR**: branch exists, change is scoped, they want merge-ready output.

## Rules

1. **One issue, one PR** — Match scope to a single Linear issue when possible. No drive-by refactors.
2. **Linear** — PR title or branch should include **`INV-___`** when it maps to an issue. Ask for the id if missing.
3. **Checks** — Run only what the diff touches:
   - `frontend/`: `npm --prefix frontend run type-check`, `lint`, and `build` if non-trivial.
   - `backend/`: `npm --prefix backend` scripts as appropriate; `curl` ping if API changed.
4. **Description** must include: **what**, **how to test**, **risk**, screenshots if UI.
5. **Stop** when the PR is ready for review — do not start new features in the same thread.

## Repo specifics

- Contributing norms: `CONTRIBUTING.md`.
- Full dev/runbook: `@cloud-agent-starter` if env or verification steps are unclear.
