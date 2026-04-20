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

export const api = {
  get: (path: string) => req(path),
  post: (path: string, body: any) =>
    req(path, { method: 'POST', body: JSON.stringify(body) }),
  patch: (path: string, body: any) =>
    req(path, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: (path: string) => req(path, { method: 'DELETE' }),
};
