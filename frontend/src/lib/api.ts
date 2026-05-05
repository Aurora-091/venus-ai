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
  const text = await res.text();
  if (!res.ok) {
    let message = text;
    try {
      const j = JSON.parse(text) as { error?: string };
      if (typeof j?.error === 'string') message = j.error;
    } catch {
      /* keep raw body */
    }
    const err = new Error(
      message || res.statusText || 'Request failed'
    ) as Error & {
      status: number;
      body?: string;
    };
    err.status = res.status;
    err.body = text;
    throw err;
  }
  if (!text) return null as unknown;
  return JSON.parse(text) as unknown;
}

export const api = {
  get: (path: string) => req(path),
  post: (path: string, body: any) =>
    req(path, { method: 'POST', body: JSON.stringify(body) }),
  patch: (path: string, body: any) =>
    req(path, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: (path: string) => req(path, { method: 'DELETE' }),
};
