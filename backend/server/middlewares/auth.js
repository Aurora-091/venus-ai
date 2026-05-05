import { supabase } from '../lib/supabase.js';

export async function attachSession(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    req.user = null;
    return next();
  }

  const token = authHeader.split(' ')[1];
  const { data: { user }, error } = await supabase.auth.getUser(token);

  if (error || !user) {
    req.user = null;
    return next();
  }

  // Supabase returns user metadata in raw_user_meta_data or user_metadata depending on token format
  // Merge it so `req.user` looks like the old MongoDB/memory user object
  req.user = {
    id: user.id,
    email: user.email,
    name: user.user_metadata?.name || '',
    role: user.user_metadata?.role || 'tenant_admin',
    tenantId: user.user_metadata?.tenantId || '',
  };

  next();
}

export function requireAuth(req, res, next) {
  if (!req.user) return res.status(401).json({ error: "Unauthorized" });
  return next();
}
