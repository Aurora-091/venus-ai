# Replace Better Auth + D1/Mongoose with Supabase (Auth + DB)

## Background

The current venus-ai project has **two parallel backends** — a Hono/Cloudflare Workers backend using Better Auth + Drizzle/D1, and an Express/Node backend using custom session cookies + Mongoose/in-memory store. This creates confusion and duplication. We'll consolidate onto **Supabase** for both auth and database, keeping the **Express backend** as the single server since it supports Socket.IO for realtime features.

## User Review Required

> [!IMPORTANT]
> **Supabase project required.** You'll need a Supabase project created at [supabase.com](https://supabase.com). I'll need these from your project dashboard:
> - `SUPABASE_URL` (e.g., `https://xxxx.supabase.co`)
> - `SUPABASE_ANON_KEY` (public key — safe for frontend)
> - `SUPABASE_SERVICE_ROLE_KEY` (private key — backend only)

> [!WARNING]
> **Deleting the Cloudflare Workers backend.** The entire `backend/api/` directory (Hono + Better Auth + Drizzle/D1) will be removed. The `backend/server/` Express backend will become the single source of truth, upgraded with Supabase. The `wrangler.json`, `drizzle.config.ts`, and `worker-configuration.d.ts` files will also be removed.

---

## Architecture After Migration

```
frontend/                     ← React + Vite (unchanged)
  src/lib/auth.ts             ← Supabase client (replaces Better Auth custom client)
  src/lib/api.ts              ← fetch with Supabase JWT auth header (replaces cookie-based)
  src/lib/supabase.ts         ← [NEW] Supabase browser client init
  .env.example                ← VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY

backend/                      ← Express backend (single backend now)
  server/
    index.js                  ← Express entry (cleaned up)
    lib/supabase.js           ← [NEW] Supabase admin client init
    middleware/auth.js         ← [NEW] JWT verification via Supabase (replaces session.js)
    routes/api.js              ← Unchanged route structure, uses Supabase DB
    routes/auth.js             ← [DELETE] — Supabase handles auth directly
    services/repositories.js   ← Rewritten: Supabase client instead of Mongoose/memory
    models/                    ← [DELETE] — Supabase uses SQL tables, not Mongoose schemas
    store/                     ← [DELETE] — no more in-memory store
    config/                    ← [DELETE] — no more MongoDB connection
  .env.example                 ← SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, etc.

  api/                         ← [DELETE entire directory]
  drizzle.config.ts            ← [DELETE]
  wrangler.json                ← [DELETE]
  worker-configuration.d.ts    ← [DELETE]
```

---

## Proposed Changes

### Frontend — Supabase Auth Client

#### [NEW] [supabase.ts](file:///c:/Users/neore/Downloads/Venis/venus-ai/frontend/src/lib/supabase.ts)
- Initialize `@supabase/supabase-js` browser client with `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- Single shared instance exported for auth and realtime

#### [MODIFY] [auth.ts](file:///c:/Users/neore/Downloads/Venis/venus-ai/frontend/src/lib/auth.ts)
- Replace the custom `authRequest()` fetch wrapper with Supabase auth methods:
  - `authClient.signIn.email()` → `supabase.auth.signInWithPassword()`
  - `authClient.signUp.email()` → `supabase.auth.signUp()`
  - `authClient.signOut()` → `supabase.auth.signOut()`
  - `authClient.useSession()` → `supabase.auth.getSession()` + `onAuthStateChange()` listener
- Keep the same `authClient` export shape so consumers (sign-in, sign-up, settings, DashboardLayout) need minimal changes

#### [MODIFY] [api.ts](file:///c:/Users/neore/Downloads/Venis/venus-ai/frontend/src/lib/api.ts)
- Add Supabase JWT `Authorization: Bearer <token>` header to every request
- Remove `credentials: "include"` (no more cookies)
- Get token via `supabase.auth.getSession()` before each request

#### [MODIFY] [.env.example](file:///c:/Users/neore/Downloads/Venis/venus-ai/frontend/.env.example)
- Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- Remove `VITE_API_BASE_URL` (keep `/api` as default)

#### [MODIFY] [sign-in.tsx](file:///c:/Users/neore/Downloads/Venis/venus-ai/frontend/src/pages/sign-in.tsx)
- Minor: adapt error handling shape from Supabase's `{ error }` response

#### [MODIFY] [sign-up.tsx](file:///c:/Users/neore/Downloads/Venis/venus-ai/frontend/src/pages/sign-up.tsx)
- Minor: same error shape update

#### [MODIFY] [onboarding.tsx](file:///c:/Users/neore/Downloads/Venis/venus-ai/frontend/src/pages/onboarding.tsx)
- Remove the comment referencing "Better Auth"

---

### Backend — Supabase Integration

#### [NEW] [supabase.js](file:///c:/Users/neore/Downloads/Venis/venus-ai/backend/server/lib/supabase.js)
- Initialize `@supabase/supabase-js` with `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`
- Service role key bypasses RLS — used for backend CRUD operations

#### [NEW] [auth.js](file:///c:/Users/neore/Downloads/Venis/venus-ai/backend/server/middleware/auth.js)
- New middleware: extracts `Authorization: Bearer <jwt>` from request
- Verifies JWT via `supabase.auth.getUser(token)`
- Sets `req.user` with Supabase user data (id, email, user_metadata)
- `requireAuth` rejects if no valid user

#### [MODIFY] [repositories.js](file:///c:/Users/neore/Downloads/Venis/venus-ai/backend/server/services/repositories.js)
- Replace all Mongoose model calls and memory store with Supabase client queries:
  - `Tenant.find()` → `supabase.from('tenants').select()`
  - `Tenant.create()` → `supabase.from('tenants').insert()`
  - etc.
- Remove Mongoose and memoryStore imports
- Use `user_metadata` from Supabase auth for role/tenantId (stored via `supabase.auth.admin.updateUserById()`)

#### [MODIFY] [api.js](file:///c:/Users/neore/Downloads/Venis/venus-ai/backend/server/routes/api.js)
- Import new `requireAuth` from new middleware
- Remove `requireAuth` import from old session.js
- No route structure changes needed

#### [MODIFY] [index.js](file:///c:/Users/neore/Downloads/Venis/venus-ai/backend/server/index.js)
- Remove `connectDatabase()` import (no MongoDB)
- Remove `attachSession` import
- Use new auth middleware
- Remove `authRouter` (Supabase handles auth client-side)

#### [DELETE] `backend/server/routes/auth.js` — sign-in/sign-up/session handled by Supabase client-side
#### [DELETE] `backend/server/middleware/session.js` — in-memory session store no longer needed
#### [DELETE] `backend/server/models/` — Mongoose schemas replaced by Supabase SQL tables
#### [DELETE] `backend/server/store/memoryStore.js` — in-memory fallback removed
#### [DELETE] `backend/server/config/` — MongoDB connection config removed

---

### Backend — Remove Cloudflare/Better Auth layer entirely

#### [DELETE] `backend/api/` — entire Hono backend (index.ts, auth.ts, middleware/, database/, migrations/)
#### [DELETE] `backend/drizzle.config.ts`
#### [DELETE] `backend/wrangler.json`
#### [DELETE] `backend/worker-configuration.d.ts`
#### [DELETE] `backend/tsconfig.worker.json`

#### [MODIFY] [package.json](file:///c:/Users/neore/Downloads/Venis/venus-ai/backend/package.json)
- Remove: `better-auth`, `drizzle-orm`, `hono`, `mongoose`
- Remove devDeps: `@cloudflare/vite-plugin`, `drizzle-kit`, `wrangler`
- Add: `@supabase/supabase-js`
- Remove scripts: `cf-typegen`, `db:generate`, `db:migrate`, `db:studio`

#### [MODIFY] [.env.example](file:///c:/Users/neore/Downloads/Venis/venus-ai/backend/.env.example)
- Remove: `MONGODB_URI`, `BETTER_AUTH_SECRET`
- Add: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`

---

### Supabase SQL Schema

#### [NEW] [supabase_schema.sql](file:///c:/Users/neore/Downloads/Venis/venus-ai/backend/supabase_schema.sql)
A migration file to create all tables in Supabase. Maps directly from the existing Drizzle schema + Mongoose models:

- `profiles` — extends Supabase auth.users with `role`, `tenant_id`
- `tenants` — same fields as current schema
- `integrations` — Google Calendar/Sheets tokens
- `call_logs` — call history
- `bookings` — appointments/reservations
- `demo_orders` — e-commerce demo data

With Row Level Security (RLS) policies for proper tenant isolation.

---

## Open Questions

> [!IMPORTANT]
> **Do you already have a Supabase project created?** If so, please share the URL and anon key so I can wire them directly into `.env` files.

> [!IMPORTANT]
> **Do you want to keep the Socket.IO realtime features?** Supabase has its own Realtime system (Postgres changes). We can either keep Socket.IO as-is (simpler migration) or migrate to Supabase Realtime (cleaner, fewer dependencies). **My recommendation: keep Socket.IO for now** to minimize scope.

---

## Verification Plan

### Automated Tests
1. Run `npm install` in both `frontend/` and `backend/` — verify no dependency errors
2. Start backend with `npm run dev` — verify server starts without import errors
3. Start frontend with `npm run dev` — verify Vite builds clean

### Manual Verification
1. Sign up a new user → verify row created in Supabase `auth.users`
2. Sign in → verify JWT returned and stored client-side
3. Create a tenant via onboarding → verify row in Supabase `tenants` table
4. Access dashboard pages → verify API calls include JWT and return data
5. Sign out → verify session cleared
