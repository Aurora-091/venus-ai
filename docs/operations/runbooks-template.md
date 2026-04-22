# Runbooks (template)

Copy sections into dedicated pages in **Notion** or expand this file when procedures become stable. Keep secrets out—reference **names** of env vars only.

## Deploy (production)

**Owner:** _name_  
**Approvers:** _name_

- [ ] Linear release issue: `INV-___`
- [ ] `main` is green (CI) and reviewed
- [ ] Vercel production deployment: _link to dashboard or deployment_
- [ ] Supabase migration applied (if any): _reference migration id or file_
- [ ] Smoke test: _checklist (login, critical path)_
- [ ] Communicate: _Slack/email if used_

## Rollback

- [ ] Identify last known good Vercel deployment: _how you find it (dashboard)_
- [ ] Promote rollback or revert Git: _team procedure_
- [ ] Verify Supabase state if migrations were forward-only: _contact / runbook_

## Incident (sev / user impact)

- [ ] Triage: what broke, scope, start time
- [ ] Mitigate: feature flag, revert, scale (as applicable)
- [ ] Communicate: _status page or channel_
- [ ] Post-incident: Linear issue for follow-up, short notes in Notion **Decisions** or **Incidents**

## Environment variables (reference)

| Name (Vercel / app) | Purpose | Updated when |
|---------------------|---------|----------------|
| `VITE_SUPABASE_URL` | Supabase project URL | New project / cutover |
| `VITE_SUPABASE_ANON_KEY` | Public anon key | Rotation policy TBD |

_Add backend or server-only vars here if you use them._
