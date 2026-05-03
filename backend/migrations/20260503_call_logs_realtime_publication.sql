-- INV-16 / Vision Phase 2: register call_logs with Supabase Realtime publication.
-- Idempotent: skips if already in publication.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'call_logs'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.call_logs;
  END IF;
END;
$$;
