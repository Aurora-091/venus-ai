# Contributing to Aurora

Thank you for helping improve Aurora. This project uses a small, deliberate workflow so a two-person team (and AI agents) can stay aligned without heavy process.

## Before you write code

1. **Track work in Linear** — Create or pick up an issue in the **Invincib1e** team. Issue ids use the **`INV`** prefix (for example `INV-42`).
2. **Read** [`docs/README.md`](docs/README.md) for the doc map, then [`docs/workflow.md`](docs/workflow.md) for how Linear, Notion, GitHub, Vercel, and Supabase fit together.

## Pull requests

- Reference the Linear issue in the PR title or description (for example **`INV-42`**).
- Prefer branch names that include the issue id, such as `feat/inv-42-short-description`.
- Fill out [`.github/PULL_REQUEST_TEMPLATE.md`](.github/PULL_REQUEST_TEMPLATE.md).
- Confirm CI passes and, for UI or auth changes, verify the **Vercel preview** when available.
- Do not commit secrets; document new environment variable **names** in the PR or in Notion, not values.

## Local development

See [`README.md`](README.md) for installing dependencies, environment variables, and running the dev server.

## Questions

Use your team’s usual channel, or leave context on the Linear issue so everyone (including agents) works from the same source of truth.
