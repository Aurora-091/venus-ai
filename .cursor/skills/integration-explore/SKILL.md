---
name: integration-explore
description: >-
  Spike or audit a third-party integration (OAuth, webhooks, telephony, Shopify,
  etc.) — scope, endpoints, env, risks, and a minimal implementation plan.
---

# Integration exploration

## Trigger

User wants to **understand, spike, or plan** an external integration — not necessarily ship production code in one shot.

## Output (always)

1. **Goal** — One sentence: what user-facing capability this unlocks.
2. **Scope** — In / out for this spike (keep **out** explicit to avoid creep).
3. **Auth & data** — How secrets flow; what we store per tenant; PII notes.
4. **API surface** — Endpoints or SDK calls we need; link to official docs.
5. **Env vars** — Table: name, where set (local/Vercel), required vs optional.
6. **Risks** — Rate limits, webhook reliability, sandbox vs prod.
7. **Phases** — **P0** smallest demo, **P1** production hardening — each with a clear "done when".

## Rules

- Prefer **reading existing repo patterns** (`backend/`) and **Notion → Integrations setup** before proposing new architecture.
- If live calls need credentials, say what is **blocked** without them and what can be validated anyway (types, error handling).
- For local full-stack verification, align with **`@cloud-agent-starter`** (ports, `VITE_API_BASE_URL`, etc.).
- **Stop** at a written plan + optional thin scaffold unless the user asks to implement P0.

## Aurora context

- Many flows are **tenant-scoped**; integration work usually touches backend + dashboard UI + env.
- Do not commit secrets; use `.env.example` updates only.
