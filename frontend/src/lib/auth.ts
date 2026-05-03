import { useCallback, useEffect } from 'react';
import { useRecoilState } from 'recoil';
import { sessionLoadingState, sessionUserState } from '../state/appState';
import { supabase } from './supabase';

/** Public site URL for OAuth redirects (must match Supabase Auth → URL Configuration). */
export function getAppOrigin(): string {
  const fromEnv = import.meta.env.VITE_APP_ORIGIN;
  if (fromEnv && typeof fromEnv === 'string' && fromEnv.length > 0) {
    return fromEnv.replace(/\/$/, '');
  }
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  return '';
}

function displayNameFromUser(user: {
  email?: string | null;
  user_metadata?: Record<string, unknown>;
}): string {
  const meta = user.user_metadata || {};
  const name = meta.name;
  if (typeof name === 'string' && name.trim()) return name.trim();
  const full = meta.full_name;
  if (typeof full === 'string' && full.trim()) return full.trim();
  const given = meta.given_name;
  const family = meta.family_name;
  const parts = [given, family].filter((x) => typeof x === 'string' && x.trim());
  if (parts.length) return parts.join(' ');
  return user.email?.split('@')[0] || '';
}

export const authClient = {
  useSession() {
    const [user, setUser] = useRecoilState(sessionUserState);
    const [isPending, setPending] = useRecoilState(sessionLoadingState);

    const loadSession = useCallback(async () => {
      setPending(true);
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        const meta = session.user.user_metadata || {};
        setUser({
          id: session.user.id,
          email: session.user.email || '',
          name: displayNameFromUser(session.user),
          role: (meta.role as string) || 'tenant_admin',
          tenantId: (meta.tenantId as string) || '',
        });
      } else {
        setUser(null);
      }
      setPending(false);
    }, [setPending, setUser]);

    useEffect(() => {
      loadSession();

      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange(() => {
        loadSession();
      });

      return () => {
        subscription.unsubscribe();
      };
    }, [loadSession]);

    return {
      data: user ? { user } : null,
      isPending,
      refetch: loadSession,
    };
  },
  signUp: {
    email: async (body: { name: string; email: string; password: string }) => {
      const { data, error } = await supabase.auth.signUp({
        email: body.email,
        password: body.password,
        options: {
          data: {
            name: body.name,
          },
        },
      });
      return { data, error };
    },
  },
  signIn: {
    email: async (body: { email: string; password: string }) => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: body.email,
        password: body.password,
      });
      return { data, error };
    },
    /** Supabase Google provider must be enabled. Add redirect URL in Dashboard → Auth → URL Configuration. */
    google: async (options?: { redirectPath?: string }) => {
      const origin = getAppOrigin();
      if (!origin) {
        return {
          data: null,
          error: new Error('Could not resolve app origin for OAuth redirect'),
        };
      }
      const path = options?.redirectPath ?? '/dashboard';
      const redirectTo = `${origin}${path.startsWith('/') ? path : `/${path}`}`;
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });
      return { data, error };
    },
  },
  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    return { data: null, error };
  },
};
