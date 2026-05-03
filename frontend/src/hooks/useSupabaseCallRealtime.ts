import { useEffect } from 'react';
import { supabase } from '../lib/supabase';

/**
 * Vision Phase 2 — live call activity via Supabase Realtime on `call_logs`.
 * Requires RLS policy + supabase_realtime publication (see backend migrations).
 */
export function useSupabaseCallRealtime(
  tenantId: string | undefined,
  onInsert?: () => void
) {
  useEffect(() => {
    if (!tenantId || !onInsert) return;

    const channel = supabase
      .channel(`call_logs:${tenantId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'call_logs',
          filter: `tenant_id=eq.${tenantId}`,
        },
        () => {
          onInsert();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [tenantId, onInsert]);
}
