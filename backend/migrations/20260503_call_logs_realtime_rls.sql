-- Vision Phase 2: dashboard Supabase Realtime on call_logs (tenant-scoped SELECT)
-- Run after deploying backend that relies on JWT tenant claims.

-- Allow authenticated users to read call_logs only for their workspace tenant.
drop policy if exists "Tenant users read own call_logs" on public.call_logs;
create policy "Tenant users read own call_logs"
  on public.call_logs
  for select
  to authenticated
  using (
    tenant_id is not null
    and tenant_id::text = coalesce((auth.jwt() -> 'user_metadata' ->> 'tenantId'), '')
  );

-- Enable Realtime for this table in Supabase: Dashboard → Database → Replication
-- → enable `call_logs` for the `supabase_realtime` publication (if not already on).
