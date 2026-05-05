# Voice engine positioning — ElevenLabs, Vapi, competitors (Aurora)

**Use:** Paste into Notion **Knowledge** as a child page, or link here from the hub. This file versions with the repo; refresh quarterly as vendors ship changes.

---

## One-line goal (specific)

**Aurora is a no-code AI receptionist for SMBs (bookings + context-aware voice in Hindi/English)—ElevenLabs is our first conversation engine for speed to demo, not our product identity; we own tenant UX, workflows, and integrations, and we will add Vapi-class orchestration later so customers can swap STT/LLM/TTS without us becoming “just another ElevenLabs UI.”**

---

## Are we “just an ElevenLabs wrapper”?

| If we only… | Then we look like… |
|-------------|-------------------|
| Recreate ElevenLabs dashboard settings in our UI | A thin wrapper |
| **Plus** multi-tenant lifecycle, calendar/commerce tools, India-first onboarding, pricing, support surface, and vertical playbooks | A **vertical OS** that **uses** ElevenLabs as one engine slot |

**MVP honesty:** Today the backend provisions **ElevenLabs Conversational AI agents** (`convai/agents/create`) with prompts, tools, and Twilio where configured—see `backend/server/routes/api.js`. That is intentional **time-to-value**. The non-wrapper proof is what you ship **around** the call: tenant model, Google (and future Shopify) tools, dashboards, Agent Studio, and **documented** plan to abstract “conversation provider” behind your own interface later.

---

## How ElevenLabs Conversational AI (“ElevenAgents”) works (product shape)

Public docs describe a **bundled voice agent**: conversation design, LLM config, tools, voice/TTS, and **deployment** options in one product.

- **Creation / config:** Agents are created and updated via API (conversation config: prompt, LLM choice, first message, language, TTS voice model, **tools** pointing at your HTTPS webhooks).
- **Runtime:** The platform runs the real-time voice loop (speech understanding, model turns, TTS) so you do not stitch raw STT + LLM + TTS yourself for that path.
- **Telephony:** First-class **Twilio** (native integration) and **SIP** options for inbound/outbound numbers; web/mobile SDKs for widget or app embeds.
- **Your code’s job:** Tenant-scoped tool endpoints (booking, order lookup), secure webhooks, observability, and mapping **one business** → **one agent** configuration.

Official overview: [ElevenAgents documentation](https://elevenlabs.io/docs/eleven-agents/overview).

---

## How Vapi (and “orchestration” stacks) differ

**Vapi** is typically described as **voice infrastructure / orchestration**: it connects **telephony + STT + LLM + TTS** with explicit control over providers and pipelines, aimed at teams that want to **compose** rather than adopt a single vendor’s end-to-end agent runtime.

| Dimension | ElevenLabs agents (current MVP path) | Vapi-style orchestration (future option) |
|-----------|--------------------------------------|------------------------------------------|
| **Primary value** | Fast, high-quality conversational voice in one product | Flexible pipelines, multi-provider, heavier integration |
| **Who configures** | Product + API; less wiring | Engineers + more moving parts |
| **Lock-in** | Stronger to ElevenLabs runtime for that path | Lower to any one TTS/LLM vendor |
| **Best when** | You need demos and pilots **now** with great voice | You need **swap** providers, cost tuning, exotic call logic |

**Pricing shape (industry articles, verify on vendor sites):** orchestration products often bill **per-minute** for the pipe **plus** underlying STT/LLM/TTS usage; ElevenLabs bundles more in one stack. Treat numbers as directional until you price your own SKU.

Third-party comparisons (not authoritative): [Broscorp — Vapi vs ElevenLabs](https://broscorp.net/cases/vapi-vs-elevenlabs-comparing-voice-ai-tools-for-building-production-ready-voice-assistants/), [Retell — Vapi vs ElevenLabs](https://www.retellai.com/blog/vapi-vs-elevenlabs).

---

## Competitors (parallel lens)

Rough buckets—see also `VISION_AND_ROADMAP.md` and `COMPETITIVE_ANALYSIS.md` in the repo.

| Bucket | Examples | What they optimize |
|--------|----------|-------------------|
| **Developer orchestration** | Vapi, Retell, Bland | Builders shipping custom voice pipelines |
| **Full-stack voice agent SaaS** | ElevenLabs agents, some Retell flows | Faster path from idea to phone/widget |
| **Enterprise / India depth** | Bolna (evolving upmarket) | Scale, deep integrations, services |

**Aurora’s wedge:** SMB owner **without engineers**—**vertical** receptionist (clinic/hotel/commerce), **Hindi/Hinglish**, predictable SaaS packaging, **you** own onboarding and integrations; ElevenLabs is the **engine under the hood** for MVP, not the story on the landing page.

---

## Where we are in the repo (today)

- **Multi-tenant** data model (`tenants`, `integrations`, `call_logs`, …) in `backend/supabase_schema.sql`.
- **Agent provisioning** against ElevenLabs Conversational AI API with per-tenant prompt, tools, voice—`backend/server/routes/api.js`.
- **Twilio** env for telephony when enabled; **Google** integrations in schema for calendar-class workflows.
- **Frontend** dashboard / Agent Studio direction in `frontend/src/pages/dashboard/agent.tsx` (product surface = “your” app, not EL’s).

**Branch context:** work on `cursor/phase2-golden-path-67ac` suggests focus on **Integration Phase 2 / golden path** style delivery—aligned if the goal is **reliable commerce or booking flows** on top of the same engine, not random platform churn.

---

## Direction check: are we straying?

**Straying** = investing mainly in **replicating vendor dashboards** or **generic voice infra** with no vertical outcome.

**On track** = each cycle ships **business-visible** slices: better booking, safer tools, tenant onboarding, analytics, Agent Studio—**with** ElevenLabs (or later Vapi) as **implementation detail** in architecture docs and ADRs.

**Concrete guardrail:** In Linear, tag work as **Vertical outcome** vs **Engine swap**; cap “engine swap” effort until one vertical repeatedly pays or pilots.

---

## Notion → how to mirror this page

1. In **Knowledge**, create **“Voice stack & positioning (ElevenLabs → Vapi)”**.
2. Paste sections above (or embed link to this file on GitHub `main`).
3. Add one bullet at top: **North star** = the one-line goal in this doc.

**Source:** `docs/knowledge/voice-engine-positioning.md` in [venus-ai](https://github.com/Aurora-091/venus-ai).
