# Aurora — product roadmap

**Purpose:** One page for *where we are going* and *in what order*. Tactical work lives in **Linear** (`INV-___`); this doc is the narrative spine you can link from Notion or pitch decks.

**How to use it:** Pick the **current phase** in Linear as a milestone or epic. When a phase’s exit criteria are met, move on — “half-baked” is allowed if the exit criteria say so.

---

## North star (end goal)

**Aurora helps small businesses run a phone-based AI agent** that handles real conversations tied to their context: bookings, calendar, and simple workflows — without hiring a developer for every change.

**When we have “won” at maturity (not required for Seed):**

- A business owner can **configure** agent behavior, voice, and tools from the dashboard.
- **Calls** are observable (logs, outcomes, basic analytics).
- **Integrations** (starting with calendar) work for a defined happy path.
- The product is **deployed**, **tenant-safe**, and **understandable** (onboarding + docs).

---

## Definitions

### Seed ready

**Audience:** Angels, pre-seed funds, design partners, and serious early users who know they are early.

**Meaning:** You can **repeat a credible demo** end-to-end, on a **stable preview or production URL**, with a **clear story** and **known gaps** listed honestly. It is *not* required to be feature-complete or heavily automated.

**Typical bar:**

- One **golden path** works every time you demo (signup → tenant → agent context → “call” or simulated flow → see result in app).
- **Staging / promotion** process (`staging` → `main`) is used so `main` stays trustworthy.
- **Docs** explain how to run the app and what is real vs placeholder (this repo + short Notion context).

### Customer ready — *half-baked* (intentionally thin)

**Audience:** Paying or pilot customers with **written** limitations.

**Meaning:** Someone can **use the product for real** on your hosted environment with **support and expectations** defined — even if many features are minimal, manual, or “good enough.”

**Typical bar:**

- **Production** app + Supabase project + Vercel (or agreed hosting) with **secrets and RLS** treated seriously.
- **Onboarding** gets a real user to first value without you in the room (may be rough).
- **Support path** exists (email, Slack, or Notion runbook — pick one).
- **Known limitations** doc: what breaks, what is manual, what is next — no surprises.
- Optional: **billing** (Stripe or manual invoicing) — many teams start with **manual** for first customers.

---

## Phases (order matters)

Work **top to bottom**. Within a phase, parallelize only if it does not block the exit criteria.

### Phase 1 — **Runnable product spine**

*Goal: A logged-in user can move through the app without dead ends on the critical path.*

| Focus | Outcomes |
|--------|-----------|
| App shell | Dashboard **overview** with real or believable placeholder stats; navigation between main sections works. |
| Routing | Central router / layout so new pages are consistent (`docs/task.md` “App router” intent). |
| Identity & tenant | Sign-in works against **Supabase**; tenant context is clear in the UI. |
| Quality gate | `type-check`, `lint`, `build` clean on CI for changes you merge to `staging`. |

**Exit criteria**

- [ ] You can demo: **land → sign in → dashboard** with no console-breaking errors.
- [ ] **One** “hero” vertical slice chosen (e.g. *call logs list* or *bookings list*) with **read** path wired to real or seed data.

---

### Phase 2 — **Golden path data & surfaces**

*Goal: The product *feels* like VoiceOS / Aurora — not just a shell.*

| Focus | Outcomes |
|--------|-----------|
| Call logs | Page lists calls / sessions; filters optional but nice. |
| Bookings | Page reflects scheduling outcomes (even if calendar sync is partial). |
| Agent Studio | **MVP**: name, prompt/system instructions, voice/provider flags — match what your stack can store today. |
| Integrations | **Google Calendar** (or your first integration): connect, status, error visible in UI. |
| Onboarding | **Wizard (thin)**: 3–5 steps that match your real setup sequence (business → agent → integration → test). |

**Exit criteria**

- [ ] Demo story holds: **“This is my agent, here is activity, here is a booking/call outcome.”**
- [ ] **Integrations** page shows **connected / failed / not configured** — no silent failure.

---

### Phase 3 — **Seed ready**

*Goal: Safe to show people who can write checks or sign a pilot LOI.*

| Focus | Outcomes |
|--------|-----------|
| Demo environment | **Preview** or **prod** URL; stable enough for a 15-minute scripted demo. |
| Seed / demo tenant | Scripted **demo account** or seed data (`docs/task.md` intent) so empty-state is not embarrassing. |
| Analytics (thin) | One chart or KPI strip tied to real or seed data — proof of “observability.” |
| Settings | Minimum: profile, workspace name, **danger zone** stub or sign-out — enough to feel “real app.” |
| Narrative | **Pitch one-pager**: problem, who it’s for, what works today, what’s next (can live in Notion). |

**Exit criteria**

- [ ] **Two teammates** can each run the demo independently without the other person fixing env.
- [ ] **Honest limitations** list exists (Notion or `docs/` — bullets, not an essay).
- [ ] **Promote flow** used: integrate on `staging`, then **`staging` → `main`** when demo-ready ([workflow.md](workflow.md)).

---

### Phase 4 — **Customer ready (half-baked)**

*Goal: A pilot customer can rely on you without pretending the product is finished.*

| Focus | Outcomes |
|--------|-----------|
| Production hardening | Backups awareness, RLS review, **no test keys** in prod; basic **runbook** (deploy, rollback, who to call). |
| Onboarding unaided | A sharp user gets to first success **without a live call** (video or in-app is fine). |
| Support | Single channel + expected response window; **how to report bugs** (template or Linear portal). |
| Commercials | **Manual billing** or **Stripe** — pick one; document what they pay for and SLAs (even “best effort”). |
| Reliability | Known **failure modes** (ElevenLabs, Twilio, Google) have user-visible messages or docs. |

**Exit criteria**

- [ ] **One pilot** can use it for real work with a **written** scope of what is in / out.
- [ ] You can answer: **What happens when it breaks?** without improvising.

---

## What we are *not* optimizing for yet

- Full **multi-region** or enterprise compliance story.
- **Perfect** automation on every integration — webhooks and manual fallbacks are acceptable in Phase 2–3.
- **Feature parity** with every competitor named in research notes — ship your **one** differentiated loop first.

---

## Links

- Tactical checklist (historical): [task.md](task.md) — prefer **Linear** for live status.
- Engineering workflow: [workflow.md](workflow.md)
- Architecture: [architecture/overview.md](architecture/overview.md)

**Review rhythm:** After each phase exit, spend 30 minutes updating this file (what slipped, what “half-baked” really meant) so the roadmap stays honest.
