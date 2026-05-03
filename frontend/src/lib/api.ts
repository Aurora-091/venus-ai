import { supabase } from './supabase';

const base = import.meta.env.VITE_API_BASE_URL || '/api';

async function req(path: string, opts?: RequestInit) {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const token = session?.access_token;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((opts?.headers as Record<string, string>) || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${base}${path}`, {
    headers,
    ...opts,
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

/** Calendar auth-url returns 503 with JSON when OAuth env is missing; parse that instead of throwing. */
export async function getCalendarAuthUrl(tenantId: string): Promise<{
  url: string | null;
  configured?: boolean;
  error?: string;
}> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const token = session?.access_token;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  const res = await fetch(`${base}/tenants/${tenantId}/calendar/auth-url`, {
    headers,
  });
  const bodyText = await res.text();
  let parsed: { url?: string | null; configured?: boolean; error?: string } =
    {};
  try {
    parsed = bodyText ? JSON.parse(bodyText) : {};
  } catch {
    /* leave parsed empty */
  }
  if (res.status === 503 && parsed.configured === false) {
    return {
      url: null,
      configured: false,
      error:
        parsed.error ||
        'Google OAuth is not configured. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in backend/.env.',
    };
  }
  if (!res.ok) {
    throw new Error(bodyText);
  }
  return parsed as { url: string | null; configured?: boolean; error?: string };
}

export const api = {
  get: (path: string) => req(path),
  post: (path: string, body: any) =>
    req(path, { method: 'POST', body: JSON.stringify(body) }),
  patch: (path: string, body: any) =>
    req(path, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: (path: string) => req(path, { method: 'DELETE' }),
};
