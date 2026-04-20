-- ═══════════════════════════════════════════════════════════════
-- VoiceOS — Supabase Schema
-- Run this in your Supabase SQL Editor (Dashboard → SQL Editor)
-- ═══════════════════════════════════════════════════════════════

-- ── Profiles (extends Supabase auth.users) ──────────────────
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null default '',
  email text not null default '',
  role text not null default 'tenant_admin',        -- super_admin | tenant_admin
  tenant_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Auto-create a profile row when a new auth user signs up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'name', ''),
    new.email,
    coalesce(new.raw_user_meta_data ->> 'role', 'tenant_admin')
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ── Tenants ─────────────────────────────────────────────────
create table if not exists tenants (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  vertical text not null,                           -- clinic | hotel | ecommerce
  slug text not null unique,
  plan text not null default 'starter',             -- starter | growth | enterprise
  status text not null default 'active',
  -- ElevenLabs + Twilio
  agent_id text default '',
  phone_number_id text default '',
  phone_number text default '',
  agent_status text not null default 'not_configured',
  -- Agent config
  agent_name text not null default 'Aria',
  agent_language text not null default 'en',
  agent_voice_id text not null default '21m00Tcm4TlvDq8ikWAM',
  agent_greeting text default '',
  business_hours_start text default '09:00',
  business_hours_end text default '18:00',
  timezone text default 'Asia/Kolkata',
  -- White-label
  whitelabel_enabled boolean default false,
  whitelabel_brand text default '',
  created_at timestamptz not null default now()
);

-- ── Integrations (Google Calendar, Sheets, etc.) ────────────
create table if not exists integrations (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  type text not null,                               -- google_calendar | google_sheets | webhook
  access_token text,
  refresh_token text,
  token_expiry timestamptz,
  calendar_id text default 'primary',
  config jsonb default '{}',
  connected boolean default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ── Call Logs ───────────────────────────────────────────────
create table if not exists call_logs (
  id bigint generated always as identity primary key,
  tenant_id uuid not null references tenants(id) on delete cascade,
  caller_number text,
  direction text not null default 'inbound',        -- inbound | outbound
  duration_seconds integer,
  outcome text default 'completed',                 -- completed | escalated | missed | voicemail
  transcript text,
  summary text,
  conversation_id text,
  created_at timestamptz not null default now()
);

-- ── Bookings ────────────────────────────────────────────────
create table if not exists bookings (
  id bigint generated always as identity primary key,
  tenant_id uuid not null references tenants(id) on delete cascade,
  caller_number text,
  caller_name text,
  caller_phone text,
  service text,
  slot_start timestamptz not null,
  slot_end timestamptz,
  status text not null default 'confirmed',         -- confirmed | cancelled | rescheduled
  google_event_id text,
  notes text,
  created_at timestamptz not null default now()
);

-- ── Demo Orders (e-commerce) ────────────────────────────────
create table if not exists demo_orders (
  id bigint generated always as identity primary key,
  tenant_id uuid not null references tenants(id) on delete cascade,
  order_number text not null,
  customer_name text not null,
  customer_phone text,
  status text not null,
  items_summary text not null,
  total numeric not null,
  expected_delivery text,
  created_at timestamptz not null default now()
);

-- ═══════════════════════════════════════════════════════════════
-- Row Level Security (RLS)
-- ═══════════════════════════════════════════════════════════════

alter table profiles enable row level security;
alter table tenants enable row level security;
alter table integrations enable row level security;
alter table call_logs enable row level security;
alter table bookings enable row level security;
alter table demo_orders enable row level security;

-- Profiles: users can read/update their own profile
create policy "Users can view own profile"
  on profiles for select using (auth.uid() = id);
create policy "Users can update own profile"
  on profiles for update using (auth.uid() = id);

-- Tenants: allow all authenticated reads (backend enforces tenant scoping via service role)
create policy "Authenticated users can read tenants"
  on tenants for select to authenticated using (true);
create policy "Service role full access to tenants"
  on tenants for all to service_role using (true);

-- Integrations, call_logs, bookings, demo_orders: service role only
-- (backend uses service_role key, so these are accessed server-side only)
create policy "Service role full access to integrations"
  on integrations for all to service_role using (true);
create policy "Service role full access to call_logs"
  on call_logs for all to service_role using (true);
create policy "Service role full access to bookings"
  on bookings for all to service_role using (true);
create policy "Service role full access to demo_orders"
  on demo_orders for all to service_role using (true);

-- Allow ElevenLabs webhook routes (unauthenticated) to insert call logs & bookings
create policy "Anon can insert call_logs"
  on call_logs for insert to anon with check (true);
create policy "Anon can insert bookings"
  on bookings for insert to anon with check (true);
create policy "Anon can select tenants for webhooks"
  on tenants for select to anon using (true);
create policy "Anon can select integrations for webhooks"
  on integrations for select to anon using (true);
create policy "Anon can select demo_orders for webhooks"
  on demo_orders for select to anon using (true);

-- ═══════════════════════════════════════════════════════════════
-- Indexes
-- ═══════════════════════════════════════════════════════════════

create index if not exists idx_profiles_tenant on profiles(tenant_id);
create index if not exists idx_integrations_tenant on integrations(tenant_id);
create index if not exists idx_call_logs_tenant on call_logs(tenant_id);
create index if not exists idx_bookings_tenant on bookings(tenant_id);
create index if not exists idx_demo_orders_tenant on demo_orders(tenant_id);
create index if not exists idx_call_logs_created on call_logs(created_at desc);
create index if not exists idx_bookings_created on bookings(created_at desc);
