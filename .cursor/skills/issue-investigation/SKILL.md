---
name: issue-investigation
description: >-
  Narrow a bug or confusing behavior before fixing — repro, layer, evidence,
  one next step. Use for "it's broken", flakes, prod vs local.
---

# Issue investigation (Triage)

## Trigger

Something **fails, flakes, or behaves wrong**; root cause is unclear.

## Process (do this order)

1. **Symptom** — What the user sees (one paragraph).
2. **Expected** — What should happen.
3. **Repro** — Numbered steps; note **local vs prod**, **browser**, **logged in or not**.
4. **Classify** — Pick primary bucket: UI · API · Supabase/auth · third-party integration · deploy/env.
5. **Evidence** — Logs, network tab, failing route, response body — minimal quotes.
6. **Hypotheses** — At most **two**; prefer the simplest.
7. **Next step** — **One** action: smallest code change, or one targeted test, or "need credential X".

## Rules

- Do **not** fix large areas or add features unless the fix is obviously one line.
- If setup is unknown, defer to **`@cloud-agent-starter`** for env and smoke paths.
- End with a short **handoff** block the other person (or **`@feature-pr`**) can use.
