import { supabase } from "../lib/supabase.js";
import crypto from "node:crypto";

const makeSlug = (name, id) => `${name.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-")}-${id.slice(0, 6)}`;

// Users are managed by Supabase Auth, but we can query the profiles table or get user by ID using Admin API if needed.
// Most endpoints already rely on req.user which is populated from the JWT.
export async function findUserByEmail(email) {
  const { data } = await supabase.from('profiles').select('*').eq('email', email.toLowerCase()).single();
  return data || null;
}

export async function findUserById(id) {
  const { data } = await supabase.from('profiles').select('*').eq('id', id).single();
  return data || null;
}

export async function listTenants(user) {
  if (user?.role === "super_admin") {
    const { data } = await supabase.from('tenants').select('*').order('created_at', { ascending: false });
    return (data || []).map(formatTenant);
  }
  if (user?.tenantId) {
    const { data } = await supabase.from('tenants').select('*').eq('id', user.tenantId);
    return (data || []).map(formatTenant);
  }
  return [];
}

export async function findTenantById(id) {
  const { data } = await supabase.from('tenants').select('*').eq('id', id).single();
  return data ? formatTenant(data) : null;
}

export async function createTenant(payload, user) {
  const id = crypto.randomUUID();
  const ext = payload.external_integrations;
  const settings =
    ext && (ext.shopifyUrl || ext.shopifyToken)
      ? {
          shopify: {
            storeUrl: ext.shopifyUrl || "",
            adminToken: ext.shopifyToken || "",
          },
        }
      : {};

  const tenant = {
    id,
    name: payload.name,
    vertical: payload.vertical,
    slug: makeSlug(payload.name, id),
    agent_name: payload.agentName || "Aria",
    agent_language: payload.agentLanguage || "en",
    agent_greeting: buildGreeting(payload.vertical, payload.agentName || "Aria", payload.name),
    status: "active",
    plan: "starter",
    settings,
  };

  const { data: created, error } = await supabase.from('tenants').insert(tenant).select('*').single();
  if (error) throw new Error(error.message);

  if (user?.id && user.role !== "super_admin") {
    // Update Supabase auth user metadata
    await supabase.auth.admin.updateUserById(user.id, {
      user_metadata: { role: "tenant_admin", tenantId: id }
    });
    // Update profile table
    await supabase.from('profiles').update({ role: "tenant_admin", tenant_id: id }).eq('id', user.id);
  }
  
  // Format for frontend
  return formatTenant(created);
}

export async function updateTenant(id, payload) {
  const existing = await findTenantById(id);
  if (!existing) return null;

  const updates = {};
  if (payload.name !== undefined) updates.name = payload.name;
  if (payload.timezone !== undefined) updates.timezone = payload.timezone;
  if (payload.agentId !== undefined) updates.agent_id = payload.agentId;
  if (payload.phoneNumberId !== undefined) updates.phone_number_id = payload.phoneNumberId;
  if (payload.phoneNumber !== undefined) updates.phone_number = payload.phoneNumber;
  if (payload.agentStatus !== undefined) updates.agent_status = payload.agentStatus;

  if (payload.agentName !== undefined) updates.agent_name = payload.agentName;
  if (payload.agentLanguage !== undefined) updates.agent_language = payload.agentLanguage;
  if (payload.agentVoiceId !== undefined) updates.agent_voice_id = payload.agentVoiceId;
  if (payload.agentGreeting !== undefined) updates.agent_greeting = payload.agentGreeting;
  if (payload.businessHoursStart !== undefined) {
    updates.business_hours_start = payload.businessHoursStart;
  }
  if (payload.businessHoursEnd !== undefined) {
    updates.business_hours_end = payload.businessHoursEnd;
  }

  if (payload.metadata?.shopify !== undefined) {
    const { data: rawRow } = await supabase
      .from('tenants')
      .select('settings')
      .eq('id', id)
      .single();
    const prev =
      rawRow?.settings && typeof rawRow.settings === 'object' ? rawRow.settings : {};
    const prevShopify = prev.shopify && typeof prev.shopify === 'object' ? prev.shopify : {};
    const nextShopify = payload.metadata.shopify;
    updates.settings = {
      ...prev,
      shopify: {
        storeUrl: nextShopify.storeUrl ?? prevShopify.storeUrl ?? "",
        adminToken: nextShopify.adminToken ?? prevShopify.adminToken ?? "",
      },
    };
  }

  const { data, error } = await supabase.from('tenants').update(updates).eq('id', id).select('*').single();
  if (error || !data) return null;
  return formatTenant(data);
}

export async function deleteTenant(id) {
  await supabase.from('tenants').delete().eq('id', id);
}

export async function listCalls(tenantId) {
  const { data } = await supabase.from('call_logs').select('*').eq('tenant_id', tenantId).order('created_at', { ascending: false }).limit(50);
  return (data || []).map(formatCallLog);
}

export async function listBookings(tenantId) {
  const { data } = await supabase.from('bookings').select('*').eq('tenant_id', tenantId).order('created_at', { ascending: false }).limit(50);
  return (data || []).map(formatBooking);
}

export async function listOrders(tenantId) {
  const { data } = await supabase.from('demo_orders').select('*').eq('tenant_id', tenantId).order('created_at', { ascending: false }).limit(50);
  return (data || []).map(formatOrder);
}

export async function createCallLog(payload) {
  const dbPayload = {
    tenant_id: payload.tenantId,
    caller_number: payload.callerNumber,
    direction: payload.direction,
    duration_seconds: payload.durationSeconds,
    outcome: payload.outcome,
    summary: payload.summary,
    conversation_id: payload.conversationId,
  };
  const { data, error } = await supabase.from('call_logs').insert(dbPayload).select('*').single();
  if (error) throw new Error(error.message);
  return formatCallLog(data);
}

export async function getAnalytics(tenantId) {
  const [calls, bookings, orders] = await Promise.all([
    listCalls(tenantId),
    listBookings(tenantId),
    listOrders(tenantId),
  ]);
  const completed = calls.filter((call) => call.outcome === "completed").length;
  const totalDuration = calls.reduce((sum, call) => sum + Number(call.durationSeconds || 0), 0);
  const callsByDay = buildCallsByDay(calls);

  return {
    totalCalls: calls.length,
    completedCalls: completed,
    escalatedCalls: calls.length - completed,
    resolutionRate: calls.length ? Math.round((completed / calls.length) * 100) : 0,
    avgDuration: calls.length ? Math.round(totalDuration / calls.length) : 0,
    totalBookings: bookings.length,
    totalOrders: orders.length,
    callsByDay,
  };
}

function buildCallsByDay(calls) {
  const days = [];
  const counts = new Map();

  for (let offset = 6; offset >= 0; offset -= 1) {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - offset);
    const key = date.toISOString().slice(0, 10);
    days.push(key);
    counts.set(key, 0);
  }

  for (const call of calls) {
    const key = String(call.createdAt || "").slice(0, 10);
    if (counts.has(key)) counts.set(key, (counts.get(key) || 0) + 1);
  }

  return days.map((date) => ({ date, count: counts.get(date) || 0 }));
}

function buildGreeting(vertical, agentName, businessName) {
  if (vertical === "clinic") return `Namaste! Main ${agentName} hoon, ${businessName} se. Main aapki kaise madad kar sakti hoon?`;
  if (vertical === "hotel") return `Good day! Thank you for calling ${businessName}. I'm ${agentName}, how may I assist you?`;
  return `Hi! I'm ${agentName} from ${businessName}. How can I help you today?`;
}

// Map snake_case from Supabase DB to camelCase for the frontend

function formatTenant(t) {
  if (!t) return null;
  const settings = t.settings && typeof t.settings === "object" ? t.settings : {};
  const shopify = settings.shopify && typeof settings.shopify === "object" ? settings.shopify : {};
  const { settings: _s, ...rest } = t;
  return {
    ...rest,
    agentId: t.agent_id,
    phoneNumberId: t.phone_number_id,
    phoneNumber: t.phone_number,
    agentStatus: t.agent_status,
    agentName: t.agent_name,
    agentLanguage: t.agent_language,
    agentVoiceId: t.agent_voice_id,
    agentGreeting: t.agent_greeting,
    businessHoursStart: t.business_hours_start,
    businessHoursEnd: t.business_hours_end,
    whitelabelEnabled: t.whitelabel_enabled,
    whitelabelBrand: t.whitelabel_brand,
    createdAt: t.created_at,
    metadata: {
      shopify: {
        storeUrl: shopify.storeUrl || "",
        adminToken: shopify.adminToken || "",
      },
    },
    shopifyConnected: Boolean(shopify.storeUrl && shopify.adminToken),
  };
}

function formatCallLog(c) {
  if (!c) return null;
  return {
    ...c,
    tenantId: c.tenant_id,
    callerNumber: c.caller_number,
    durationSeconds: c.duration_seconds,
    conversationId: c.conversation_id,
    createdAt: c.created_at,
  };
}

function formatBooking(b) {
  if (!b) return null;
  return {
    ...b,
    tenantId: b.tenant_id,
    callerNumber: b.caller_number,
    callerName: b.caller_name,
    callerPhone: b.caller_phone,
    slotStart: b.slot_start,
    slotEnd: b.slot_end,
    googleEventId: b.google_event_id,
    createdAt: b.created_at,
  };
}

function formatOrder(o) {
  if (!o) return null;
  return {
    ...o,
    tenantId: o.tenant_id,
    orderNumber: o.order_number,
    customerName: o.customer_name,
    customerPhone: o.customer_phone,
    itemsSummary: o.items_summary,
    expectedDelivery: o.expected_delivery,
    createdAt: o.created_at,
  };
}

export async function upsertIntegration(tenantId, type, updateData) {
  const { data: existing } = await supabase.from('integrations')
    .select('*').eq('tenant_id', tenantId).eq('type', type).single();

  if (existing) {
    const { data } = await supabase.from('integrations')
      .update(updateData).eq('id', existing.id).select('*').single();
    return data;
  } else {
    const { data } = await supabase.from('integrations')
      .insert({ tenant_id: tenantId, type, ...updateData }).select('*').single();
    return data;
  }
}

export async function getIntegration(tenantId, type) {
  const { data } = await supabase.from('integrations')
    .select('*').eq('tenant_id', tenantId).eq('type', type).single();
  return data || null;
}
