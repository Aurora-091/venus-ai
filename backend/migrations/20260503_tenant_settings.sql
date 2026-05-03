-- Add settings JSONB for tenant-scoped app config (Agent Studio, integrations).
-- Run in Supabase SQL editor if the table was created from an older schema.
alter table public.tenants
  add column if not exists settings jsonb not null default '{}';
