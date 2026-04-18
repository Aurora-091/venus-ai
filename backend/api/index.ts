import { Hono } from "hono";
import { cors } from "hono/cors";
import { env } from "cloudflare:workers";
import { drizzle } from "drizzle-orm/d1";
import { eq, desc, and } from "drizzle-orm";
import * as schema from "./database/schema";
import { tenants, integrations, callLogs, bookings, demoOrders, user as userTable } from "./database/schema";
import { createAuth } from "./auth";
import { authMiddleware, authenticatedOnly } from "./middleware/auth";

const app = new Hono().basePath("api");
app.use(cors({ origin: "*" }));

const getDB = () => drizzle((env as any).DB, { schema });

// ── Auth routes ──
app.all("/auth/*", (c) => {
  const auth = createAuth(`${new URL(c.req.url).protocol}//${new URL(c.req.url).host}`);
  return auth.handler(c.req.raw);
});

// ── Health ──
app.get("/ping", (c) => c.json({ ok: true, ts: Date.now() }));

// ── Apply auth middleware to all protected routes ──
app.use("/*", authMiddleware);

// ── Session ──
app.get("/me", authenticatedOnly, (c) => {
  const user = c.get("user");
  return c.json({ user });
});

// ──────────────────────────────────────────
// TENANTS
// ──────────────────────────────────────────

app.get("/tenants", authenticatedOnly, async (c) => {
  const db = getDB();
  const sessionUser = c.get("user") as any;
  // Fetch full user from DB to get role (Better Auth session omits custom fields)
  const dbUsers = await db.select().from(userTable).where(eq(userTable.id, sessionUser.id)).limit(1);
  const user = dbUsers[0] || sessionUser;
  let rows;
  if (user.role === "super_admin") {
    rows = await db.select().from(tenants).orderBy(desc(tenants.createdAt));
  } else {
    rows = await db.select().from(tenants).where(eq(tenants.id, user.tenantId || "")).limit(1);
  }
  return c.json({ tenants: rows });
});

app.get("/tenants/:id", authenticatedOnly, async (c) => {
  const db = getDB();
  const id = c.req.param("id");
  const rows = await db.select().from(tenants).where(eq(tenants.id, id)).limit(1);
  if (!rows.length) return c.json({ error: "Not found" }, 404);
  return c.json({ tenant: rows[0] });
});

app.post("/tenants", authenticatedOnly, async (c) => {
  const db = getDB();
  const body = await c.req.json();
  const user = c.get("user") as any;
  const id = crypto.randomUUID();
  const slug = body.name.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-");
  const now = new Date().toISOString();

  const agentGreeting = buildGreeting(body.vertical, body.agentName || "Aria", body.name);

  await db.insert(tenants).values({
    id,
    name: body.name,
    vertical: body.vertical,
    slug: `${slug}-${id.slice(0, 6)}`,
    plan: "starter",
    status: "active",
    agentName: body.agentName || "Aria",
    agentLanguage: body.agentLanguage || "en",
    agentVoiceId: body.agentVoiceId || "21m00Tcm4TlvDq8ikWAM",
    agentGreeting,
    businessHoursStart: body.businessHoursStart || "09:00",
    businessHoursEnd: body.businessHoursEnd || "18:00",
    timezone: body.timezone || "Asia/Kolkata",
    createdAt: now,
  });

  // Link tenant to the creating user (unless super_admin — they manage all)
  if (user.role !== "super_admin") {
    await db.update(userTable)
      .set({ tenantId: id, role: "tenant_admin" })
      .where(eq(userTable.id, user.id));
  }

  return c.json({ success: true, tenantId: id });
});

app.patch("/tenants/:id", authenticatedOnly, async (c) => {
  const db = getDB();
  const id = c.req.param("id");
  const body = await c.req.json();
  await db.update(tenants).set({ ...body }).where(eq(tenants.id, id));
  return c.json({ success: true });
});

// ──────────────────────────────────────────
// AGENT SETUP (ElevenLabs + Twilio per tenant)
// ──────────────────────────────────────────

app.post("/tenants/:id/setup-agent", authenticatedOnly, async (c) => {
  const db = getDB();
  const id = c.req.param("id");
  const ELEVENLABS_API_KEY = (env as any).ELEVENLABS_API_KEY || "";
  const TWILIO_ACCOUNT_SID = (env as any).TWILIO_ACCOUNT_SID || "";
  const TWILIO_AUTH_TOKEN = (env as any).TWILIO_AUTH_TOKEN || "";
  const TWILIO_PHONE_NUMBER = (env as any).TWILIO_PHONE_NUMBER || "";

  if (!ELEVENLABS_API_KEY) return c.json({ error: "Missing ELEVENLABS_API_KEY" }, 500);

  const rows = await db.select().from(tenants).where(eq(tenants.id, id)).limit(1);
  if (!rows.length) return c.json({ error: "Tenant not found" }, 404);
  const tenant = rows[0];

  if (tenant.agentStatus === "active" && tenant.agentId && tenant.phoneNumberId) {
    return c.json({ success: true, message: "Already configured", agentId: tenant.agentId });
  }

  const body = await c.req.json().catch(() => ({})) as any;
  const webhookBase = body.webhook_base_url || `${new URL(c.req.url).protocol}//${new URL(c.req.url).host}`;
  const systemPrompt = buildSystemPrompt(tenant.vertical, tenant.agentName, tenant.name);
  const ttsModelId = tenant.agentLanguage === "en" ? "eleven_flash_v2" : "eleven_flash_v2_5";

  // Create ElevenLabs agent
  const agentPayload: any = {
    name: `${tenant.name} — ${tenant.agentName}`,
    conversation_config: {
      agent: {
        prompt: {
          prompt: systemPrompt,
          llm: "gemini-2.0-flash",
          tools: buildTools(tenant.vertical, id, webhookBase),
        },
        first_message: tenant.agentGreeting || buildGreeting(tenant.vertical, tenant.agentName, tenant.name),
        language: tenant.agentLanguage,
      },
      tts: { voice_id: tenant.agentVoiceId, model_id: ttsModelId },
    },
  };

  const agentRes = await fetch("https://api.elevenlabs.io/v1/convai/agents/create", {
    method: "POST",
    headers: { "Content-Type": "application/json", "xi-api-key": ELEVENLABS_API_KEY },
    body: JSON.stringify(agentPayload),
  });

  if (!agentRes.ok) {
    const err = await agentRes.text();
    return c.json({ error: "Failed to create agent", details: err }, 500);
  }

  const agentData: any = await agentRes.json();
  const agentId = agentData.agent_id;

  await db.update(tenants).set({ agentId, agentStatus: "agent_created" }).where(eq(tenants.id, id));

  // Import Twilio phone
  if (TWILIO_PHONE_NUMBER) {
    const phoneRes = await fetch("https://api.elevenlabs.io/v1/convai/phone-numbers", {
      method: "POST",
      headers: { "Content-Type": "application/json", "xi-api-key": ELEVENLABS_API_KEY },
      body: JSON.stringify({
        phone_number: TWILIO_PHONE_NUMBER,
        label: `${tenant.name} Support`,
        sid: TWILIO_ACCOUNT_SID,
        token: TWILIO_AUTH_TOKEN,
        provider: "twilio",
        agent_id: agentId,
      }),
    });

    if (phoneRes.ok) {
      const phoneData: any = await phoneRes.json();
      await db.update(tenants).set({
        phoneNumberId: phoneData.phone_number_id,
        phoneNumber: TWILIO_PHONE_NUMBER,
        agentStatus: "active",
      }).where(eq(tenants.id, id));
    }
  } else {
    await db.update(tenants).set({ agentStatus: "active" }).where(eq(tenants.id, id));
  }

  return c.json({ success: true, agentId });
});

// ──────────────────────────────────────────
// GOOGLE CALENDAR OAUTH
// ──────────────────────────────────────────

app.get("/tenants/:id/calendar/auth-url", authenticatedOnly, async (c) => {
  const id = c.req.param("id");
  const CLIENT_ID = (env as any).GOOGLE_CLIENT_ID || "";
  if (!CLIENT_ID) return c.json({ error: "Google OAuth not configured" }, 500);

  const redirectUri = `${new URL(c.req.url).protocol}//${new URL(c.req.url).host}/api/tenants/${id}/calendar/callback`;
  const scopes = [
    "https://www.googleapis.com/auth/calendar",
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/drive.file",
  ];
  const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  url.searchParams.set("client_id", CLIENT_ID);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", scopes.join(" "));
  url.searchParams.set("access_type", "offline");
  url.searchParams.set("prompt", "consent");
  url.searchParams.set("state", id);

  return c.json({ url: url.toString() });
});

app.get("/tenants/:id/calendar/callback", async (c) => {
  const id = c.req.param("id");
  const code = c.req.query("code") || "";
  const CLIENT_ID = (env as any).GOOGLE_CLIENT_ID || "";
  const CLIENT_SECRET = (env as any).GOOGLE_CLIENT_SECRET || "";

  if (!code) return c.html("<h1>Error: no code</h1>", 400);

  const redirectUri = `${new URL(c.req.url).protocol}//${new URL(c.req.url).host}/api/tenants/${id}/calendar/callback`;

  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code, client_id: CLIENT_ID, client_secret: CLIENT_SECRET,
      redirect_uri: redirectUri, grant_type: "authorization_code",
    }),
  });

  if (!tokenRes.ok) return c.html("<h1>Token exchange failed</h1>", 500);

  const tokens: any = await tokenRes.json();
  const db = getDB();
  const now = new Date().toISOString();

  const existing = await db.select().from(integrations)
    .where(and(eq(integrations.tenantId, id), eq(integrations.type, "google_calendar"))).limit(1);

  if (existing.length) {
    await db.update(integrations).set({
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token || existing[0].refreshToken,
      tokenExpiry: new Date(Date.now() + tokens.expires_in * 1000).toISOString(),
      connected: true,
      updatedAt: now,
    }).where(and(eq(integrations.tenantId, id), eq(integrations.type, "google_calendar")));
  } else {
    await db.insert(integrations).values({
      id: crypto.randomUUID(),
      tenantId: id,
      type: "google_calendar",
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      tokenExpiry: new Date(Date.now() + tokens.expires_in * 1000).toISOString(),
      connected: true,
      createdAt: now,
      updatedAt: now,
    });
  }

  return c.html(`<html><body><script>window.close();window.opener&&window.opener.postMessage({type:'calendar_connected',tenantId:'${id}'},'*')</script><h2>Calendar connected! You can close this window.</h2></body></html>`);
});

app.get("/tenants/:id/calendar/status", authenticatedOnly, async (c) => {
  const db = getDB();
  const id = c.req.param("id");
  const rows = await db.select().from(integrations)
    .where(and(eq(integrations.tenantId, id), eq(integrations.type, "google_calendar"))).limit(1);
  return c.json({ connected: rows[0]?.connected || false, calendarId: rows[0]?.calendarId || "primary" });
});

app.delete("/tenants/:id/calendar", authenticatedOnly, async (c) => {
  const db = getDB();
  const id = c.req.param("id");
  await db.update(integrations).set({ connected: false, accessToken: null, refreshToken: null })
    .where(and(eq(integrations.tenantId, id), eq(integrations.type, "google_calendar")));
  return c.json({ success: true });
});

// ──────────────────────────────────────────
// VOICE TOOL WEBHOOKS (called by ElevenLabs agent during call)
// ──────────────────────────────────────────

// Check calendar availability
app.post("/tenants/:id/tools/check-availability", async (c) => {
  const db = getDB();
  const tenantId = c.req.param("id");
  const body = await c.req.json();
  const params = body.parameters || body;
  const requestedDate = params.date || params.requested_date || "";

  const integration = await db.select().from(integrations)
    .where(and(eq(integrations.tenantId, tenantId), eq(integrations.type, "google_calendar"))).limit(1);

  if (!integration.length || !integration[0].connected || !integration[0].accessToken) {
    // Return mock slots if no calendar connected
    return c.json({ result: getMockSlots(requestedDate) });
  }

  try {
    const accessToken = await refreshGoogleToken(integration[0], db, tenantId);
    const calendarId = integration[0].calendarId || "primary";
    const dateObj = requestedDate ? new Date(requestedDate) : new Date();
    dateObj.setHours(0, 0, 0, 0);
    const dayEnd = new Date(dateObj);
    dayEnd.setHours(23, 59, 59, 999);

    const freeBusyRes = await fetch("https://www.googleapis.com/calendar/v3/freeBusy", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
      body: JSON.stringify({
        timeMin: dateObj.toISOString(),
        timeMax: dayEnd.toISOString(),
        items: [{ id: calendarId }],
      }),
    });

    const freebusy: any = await freeBusyRes.json();
    const busy: any[] = freebusy.calendars?.[calendarId]?.busy || [];
    const slots = generateAvailableSlots(dateObj, busy);

    return c.json({ result: slots.length > 0
      ? `Available slots on ${formatDate(dateObj)}: ${slots.slice(0, 4).join(", ")}. Which time works for you?`
      : `No available slots on ${formatDate(dateObj)}. Would you like to check another day?`
    });
  } catch (e: any) {
    return c.json({ result: getMockSlots(requestedDate) });
  }
});

// Book appointment
app.post("/tenants/:id/tools/book-appointment", async (c) => {
  const db = getDB();
  const tenantId = c.req.param("id");
  const body = await c.req.json();
  const params = body.parameters || body;
  const callerName = params.caller_name || params.name || "Patient";
  const callerPhone = params.caller_phone || params.phone || "";
  const slotTime = params.slot || params.time || params.appointment_time || "";
  const service = params.service || "Consultation";
  const now = new Date().toISOString();

  const tenantRows = await db.select().from(tenants).where(eq(tenants.id, tenantId)).limit(1);
  const tenant = tenantRows[0];

  const integration = await db.select().from(integrations)
    .where(and(eq(integrations.tenantId, tenantId), eq(integrations.type, "google_calendar"))).limit(1);

  let googleEventId = null;
  let slotStart = slotTime;
  let slotEnd = "";

  if (integration.length && integration[0].connected && integration[0].accessToken) {
    try {
      const accessToken = await refreshGoogleToken(integration[0], db, tenantId);
      const calendarId = integration[0].calendarId || "primary";

      const startDt = parseSlotToDateTime(slotTime);
      const endDt = new Date(startDt.getTime() + 30 * 60 * 1000);
      slotStart = startDt.toISOString();
      slotEnd = endDt.toISOString();

      const eventRes = await fetch(`https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify({
          summary: `${service} — ${callerName}`,
          description: `Booked via VoiceOS\nPatient: ${callerName}\nPhone: ${callerPhone}`,
          start: { dateTime: startDt.toISOString(), timeZone: tenant?.timezone || "Asia/Kolkata" },
          end: { dateTime: endDt.toISOString(), timeZone: tenant?.timezone || "Asia/Kolkata" },
        }),
      });

      const eventData: any = await eventRes.json();
      googleEventId = eventData.id || null;
    } catch (e) { /* fallback to mock */ }
  }

  // Log the booking
  await db.insert(bookings).values({
    tenantId,
    callerName,
    callerPhone,
    service,
    slotStart: slotStart || now,
    slotEnd: slotEnd || "",
    status: "confirmed",
    googleEventId,
    createdAt: now,
  });

  // Auto-sync to Google Sheets if connected (fire-and-forget)
  (async () => {
    try {
      const sheetsRows = await db.select().from(integrations)
        .where(and(eq(integrations.tenantId, tenantId), eq(integrations.type, "google_sheets"))).limit(1);
      if (!sheetsRows.length || !sheetsRows[0].connected) return;
      const calRows = await db.select().from(integrations)
        .where(and(eq(integrations.tenantId, tenantId), eq(integrations.type, "google_calendar"))).limit(1);
      if (!calRows.length || !calRows[0].connected) return;
      const accessToken = await refreshGoogleToken(calRows[0], db, tenantId);
      const cfg = JSON.parse(sheetsRows[0].config || "{}");
      if (cfg.spreadsheetId) {
        await syncSheetsData(accessToken, cfg.spreadsheetId, tenantId, db);
        await db.update(integrations).set({ config: JSON.stringify({ ...cfg, lastSync: now }), updatedAt: now })
          .where(and(eq(integrations.tenantId, tenantId), eq(integrations.type, "google_sheets")));
      }
    } catch (_) { /* silent — don't break the call flow */ }
  })();

  return c.json({
    result: `Appointment confirmed for ${callerName} on ${formatSlotForSpeech(slotTime)}. You'll receive a confirmation. Is there anything else I can help you with?`
  });
});

// Order lookup (e-commerce)
app.post("/tenants/:id/tools/order-lookup", async (c) => {
  const db = getDB();
  const tenantId = c.req.param("id");
  const body = await c.req.json();
  const params = body.parameters || body;
  const orderNumber = params.order_number || params.orderNumber || "";

  if (!orderNumber) return c.json({ result: "Please provide your order number." });

  const rows = await db.select().from(demoOrders)
    .where(and(eq(demoOrders.tenantId, tenantId), eq(demoOrders.orderNumber, String(orderNumber))))
    .limit(1);

  if (!rows.length) return c.json({ result: `I couldn't find order ${orderNumber}. Please double-check the number.` });

  const o = rows[0];
  const delivery = o.expectedDelivery ? `, expected delivery ${o.expectedDelivery}` : "";
  return c.json({ result: { order_number: o.orderNumber, customer: o.customerName, status: o.status, items: o.itemsSummary, total: `₹${o.total.toLocaleString()}${delivery}` } });
});

// End call (system tool — ElevenLabs handles it, but we can log it)
app.post("/tenants/:id/tools/end-call", async (c) => {
  return c.json({ result: "Goodbye! Have a great day." });
});

// ──────────────────────────────────────────
// CALL LOGS
// ──────────────────────────────────────────

app.get("/tenants/:id/calls", authenticatedOnly, async (c) => {
  const db = getDB();
  const tenantId = c.req.param("id");
  const rows = await db.select().from(callLogs)
    .where(eq(callLogs.tenantId, tenantId))
    .orderBy(desc(callLogs.createdAt))
    .limit(50);
  return c.json({ calls: rows });
});

app.post("/tenants/:id/calls", async (c) => {
  const db = getDB();
  const tenantId = c.req.param("id");
  const body = await c.req.json();
  const now = new Date().toISOString();
  await db.insert(callLogs).values({
    tenantId,
    callerNumber: body.caller_number || body.callerNumber || "",
    direction: body.direction || "inbound",
    durationSeconds: body.duration_seconds || null,
    outcome: body.outcome || "completed",
    transcript: body.transcript || null,
    summary: body.summary || null,
    conversationId: body.conversation_id || null,
    createdAt: now,
  });
  return c.json({ success: true });
});

// ──────────────────────────────────────────
// BOOKINGS
// ──────────────────────────────────────────

app.get("/tenants/:id/bookings", authenticatedOnly, async (c) => {
  const db = getDB();
  const tenantId = c.req.param("id");
  const rows = await db.select().from(bookings)
    .where(eq(bookings.tenantId, tenantId))
    .orderBy(desc(bookings.createdAt))
    .limit(50);
  return c.json({ bookings: rows });
});

// ──────────────────────────────────────────
// ANALYTICS
// ──────────────────────────────────────────

app.get("/tenants/:id/analytics", authenticatedOnly, async (c) => {
  const db = getDB();
  const tenantId = c.req.param("id");

  const calls = await db.select().from(callLogs).where(eq(callLogs.tenantId, tenantId));
  const bkgs = await db.select().from(bookings).where(eq(bookings.tenantId, tenantId));

  const totalCalls = calls.length;
  const completedCalls = calls.filter(c => c.outcome === "completed").length;
  const escalatedCalls = calls.filter(c => c.outcome === "escalated").length;
  const totalBookings = bkgs.length;
  const avgDuration = calls.length > 0
    ? Math.round(calls.reduce((s, c) => s + (c.durationSeconds || 0), 0) / calls.length)
    : 0;

  // Last 7 days breakdown
  const days: Record<string, number> = {};
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days[d.toISOString().slice(0, 10)] = 0;
  }
  for (const call of calls) {
    const day = call.createdAt?.slice(0, 10);
    if (day && days[day] !== undefined) days[day]++;
  }

  return c.json({
    totalCalls,
    completedCalls,
    escalatedCalls,
    totalBookings,
    avgDuration,
    callsByDay: Object.entries(days).map(([date, count]) => ({ date, count })),
    resolutionRate: totalCalls > 0 ? Math.round((completedCalls / totalCalls) * 100) : 0,
  });
});

// ──────────────────────────────────────────
// OUTBOUND CALLS
// ──────────────────────────────────────────

app.post("/tenants/:id/outbound-call", authenticatedOnly, async (c) => {
  const ELEVENLABS_API_KEY = (env as any).ELEVENLABS_API_KEY || "";
  if (!ELEVENLABS_API_KEY) return c.json({ error: "Missing ELEVENLABS_API_KEY" }, 500);

  const db = getDB();
  const tenantId = c.req.param("id");
  const body = await c.req.json();

  const tenantRows = await db.select().from(tenants).where(eq(tenants.id, tenantId)).limit(1);
  if (!tenantRows.length) return c.json({ error: "Tenant not found" }, 404);
  const tenant = tenantRows[0];

  if (!tenant.agentId || !tenant.phoneNumberId) return c.json({ error: "Agent not configured" }, 400);

  const res = await fetch("https://api.elevenlabs.io/v1/convai/twilio/outbound-call", {
    method: "POST",
    headers: { "Content-Type": "application/json", "xi-api-key": ELEVENLABS_API_KEY },
    body: JSON.stringify({
      agent_id: tenant.agentId,
      agent_phone_number_id: tenant.phoneNumberId,
      to_number: body.to_number,
    }),
  });

  if (!res.ok) return c.json({ error: "Call failed", details: await res.text() }, 500);

  const data: any = await res.json();
  const now = new Date().toISOString();

  await db.insert(callLogs).values({
    tenantId,
    callerNumber: body.to_number,
    direction: "outbound",
    outcome: "completed",
    summary: "Outbound call initiated",
    conversationId: data.conversation_id || null,
    createdAt: now,
  });

  return c.json({ success: true, conversation_id: data.conversation_id });
});

// ──────────────────────────────────────────
// ORDERS (ecommerce)
// ──────────────────────────────────────────

app.get("/tenants/:id/orders", authenticatedOnly, async (c) => {
  const db = getDB();
  const tenantId = c.req.param("id");
  const rows = await db.select().from(demoOrders).where(eq(demoOrders.tenantId, tenantId)).orderBy(desc(demoOrders.createdAt));
  return c.json({ orders: rows });
});

// ──────────────────────────────────────────
// GOOGLE SHEETS INTEGRATION
// ──────────────────────────────────────────

// Get sheets integration status
app.get("/tenants/:id/sheets/status", authenticatedOnly, async (c) => {
  const db = getDB();
  const tenantId = c.req.param("id");
  const rows = await db.select().from(integrations)
    .where(and(eq(integrations.tenantId, tenantId), eq(integrations.type, "google_sheets"))).limit(1);
  if (!rows.length || !rows[0].connected) return c.json({ connected: false });
  const cfg = JSON.parse(rows[0].config || "{}");
  return c.json({ connected: true, spreadsheetId: cfg.spreadsheetId, spreadsheetUrl: cfg.spreadsheetUrl, lastSync: cfg.lastSync || null });
});

// Create a new Google Sheet for this tenant and store ID
app.post("/tenants/:id/sheets/create", authenticatedOnly, async (c) => {
  const db = getDB();
  const tenantId = c.req.param("id");

  // Get calendar integration to reuse tokens (same OAuth scope)
  const calRows = await db.select().from(integrations)
    .where(and(eq(integrations.tenantId, tenantId), eq(integrations.type, "google_calendar"))).limit(1);
  if (!calRows.length || !calRows[0].connected) return c.json({ error: "Connect Google Calendar first — it shares the same login" }, 400);

  const accessToken = await refreshGoogleToken(calRows[0], db, tenantId);
  const tenantRows = await db.select().from(tenants).where(eq(tenants.id, tenantId)).limit(1);
  const tenant = tenantRows[0];
  const now = new Date().toISOString();

  // Create spreadsheet with 4 sheets
  const createRes = await fetch("https://sheets.googleapis.com/v4/spreadsheets", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
    body: JSON.stringify({
      properties: { title: `VoiceOS — ${tenant?.name || tenantId}` },
      sheets: [
        { properties: { title: "Call Logs", sheetId: 0 } },
        { properties: { title: "Bookings", sheetId: 1 } },
        { properties: { title: "Orders", sheetId: 2 } },
        { properties: { title: "Analytics", sheetId: 3 } },
      ],
    }),
  });

  if (!createRes.ok) {
    const err = await createRes.text();
    return c.json({ error: "Failed to create sheet", details: err }, 500);
  }

  const sheetData: any = await createRes.json();
  const spreadsheetId = sheetData.spreadsheetId;
  const spreadsheetUrl = sheetData.spreadsheetUrl;

  // Add headers to each sheet
  await addSheetHeaders(accessToken, spreadsheetId);

  // Save to integrations table
  const existingSheets = await db.select().from(integrations)
    .where(and(eq(integrations.tenantId, tenantId), eq(integrations.type, "google_sheets"))).limit(1);

  const cfg = JSON.stringify({ spreadsheetId, spreadsheetUrl, lastSync: now });

  if (existingSheets.length) {
    await db.update(integrations).set({ connected: true, config: cfg, updatedAt: now })
      .where(and(eq(integrations.tenantId, tenantId), eq(integrations.type, "google_sheets")));
  } else {
    await db.insert(integrations).values({
      id: crypto.randomUUID(), tenantId, type: "google_sheets",
      connected: true, config: cfg, createdAt: now, updatedAt: now,
    });
  }

  // Do initial sync
  await syncSheetsData(accessToken, spreadsheetId, tenantId, db);

  return c.json({ success: true, spreadsheetId, spreadsheetUrl });
});

// Link an existing Google Sheet by ID
app.post("/tenants/:id/sheets/link", authenticatedOnly, async (c) => {
  const db = getDB();
  const tenantId = c.req.param("id");
  const body = await c.req.json();
  const { spreadsheetId } = body;
  if (!spreadsheetId) return c.json({ error: "spreadsheetId required" }, 400);

  const calRows = await db.select().from(integrations)
    .where(and(eq(integrations.tenantId, tenantId), eq(integrations.type, "google_calendar"))).limit(1);
  if (!calRows.length || !calRows[0].connected) return c.json({ error: "Connect Google Calendar first" }, 400);

  const accessToken = await refreshGoogleToken(calRows[0], db, tenantId);
  const now = new Date().toISOString();

  // Verify the sheet exists + get URL
  const infoRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?fields=spreadsheetUrl,properties.title`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!infoRes.ok) return c.json({ error: "Sheet not found or no access" }, 404);
  const info: any = await infoRes.json();

  const cfg = JSON.stringify({ spreadsheetId, spreadsheetUrl: info.spreadsheetUrl, lastSync: null });
  const existing = await db.select().from(integrations)
    .where(and(eq(integrations.tenantId, tenantId), eq(integrations.type, "google_sheets"))).limit(1);

  if (existing.length) {
    await db.update(integrations).set({ connected: true, config: cfg, updatedAt: now })
      .where(and(eq(integrations.tenantId, tenantId), eq(integrations.type, "google_sheets")));
  } else {
    await db.insert(integrations).values({
      id: crypto.randomUUID(), tenantId, type: "google_sheets",
      connected: true, config: cfg, createdAt: now, updatedAt: now,
    });
  }

  return c.json({ success: true, spreadsheetId, spreadsheetUrl: info.spreadsheetUrl });
});

// Sync all data to Google Sheet NOW
app.post("/tenants/:id/sheets/sync", authenticatedOnly, async (c) => {
  const db = getDB();
  const tenantId = c.req.param("id");

  const sheetsRows = await db.select().from(integrations)
    .where(and(eq(integrations.tenantId, tenantId), eq(integrations.type, "google_sheets"))).limit(1);
  if (!sheetsRows.length || !sheetsRows[0].connected) return c.json({ error: "Google Sheets not connected" }, 400);

  const calRows = await db.select().from(integrations)
    .where(and(eq(integrations.tenantId, tenantId), eq(integrations.type, "google_calendar"))).limit(1);
  if (!calRows.length || !calRows[0].connected) return c.json({ error: "Google Calendar auth required for token" }, 400);

  const accessToken = await refreshGoogleToken(calRows[0], db, tenantId);
  const cfg = JSON.parse(sheetsRows[0].config || "{}");
  const spreadsheetId = cfg.spreadsheetId;
  if (!spreadsheetId) return c.json({ error: "No spreadsheet linked" }, 400);

  const { rowsSynced } = await syncSheetsData(accessToken, spreadsheetId, tenantId, db);
  const now = new Date().toISOString();

  // Update lastSync
  const newCfg = JSON.stringify({ ...cfg, lastSync: now });
  await db.update(integrations).set({ config: newCfg, updatedAt: now })
    .where(and(eq(integrations.tenantId, tenantId), eq(integrations.type, "google_sheets")));

  return c.json({ success: true, rowsSynced, syncedAt: now });
});

// Disconnect Google Sheets
app.delete("/tenants/:id/sheets", authenticatedOnly, async (c) => {
  const db = getDB();
  const tenantId = c.req.param("id");
  await db.update(integrations).set({ connected: false, updatedAt: new Date().toISOString() })
    .where(and(eq(integrations.tenantId, tenantId), eq(integrations.type, "google_sheets")));
  return c.json({ success: true });
});

// ── Sheets helpers ──────────────────────────────────────────────────────────

async function addSheetHeaders(accessToken: string, spreadsheetId: string) {
  const headerData = [
    {
      range: "Call Logs!A1:I1",
      values: [["Date", "Caller Number", "Direction", "Duration (s)", "Outcome", "Summary", "Conversation ID", "Tenant", "Created At"]],
    },
    {
      range: "Bookings!A1:H1",
      values: [["Date", "Customer Name", "Phone", "Service", "Slot Start", "Slot End", "Status", "Google Event ID"]],
    },
    {
      range: "Orders!A1:G1",
      values: [["Order #", "Customer", "Phone", "Items", "Total (₹)", "Status", "Expected Delivery"]],
    },
    {
      range: "Analytics!A1:B1",
      values: [["Metric", "Value"]],
    },
  ];

  await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchUpdate`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
    body: JSON.stringify({
      valueInputOption: "RAW",
      data: headerData,
    }),
  });

  // Bold + freeze headers
  await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
    body: JSON.stringify({
      requests: [0, 1, 2, 3].flatMap(sheetId => ([
        {
          repeatCell: {
            range: { sheetId, startRowIndex: 0, endRowIndex: 1 },
            cell: {
              userEnteredFormat: {
                backgroundColor: { red: 0.051, green: 0.047, blue: 0.082 },
                textFormat: { bold: true, foregroundColor: { red: 0.576, green: 0.706, blue: 1.0 } },
              },
            },
            fields: "userEnteredFormat(backgroundColor,textFormat)",
          },
        },
        {
          updateSheetProperties: {
            properties: { sheetId, gridProperties: { frozenRowCount: 1 } },
            fields: "gridProperties.frozenRowCount",
          },
        },
      ])),
    }),
  });
}

async function syncSheetsData(accessToken: string, spreadsheetId: string, tenantId: string, db: any) {
  const calls = await db.select().from(callLogs).where(eq(callLogs.tenantId, tenantId)).orderBy(desc(callLogs.createdAt));
  const bkgs = await db.select().from(bookings).where(eq(bookings.tenantId, tenantId)).orderBy(desc(bookings.createdAt));
  const orders = await db.select().from(demoOrders).where(eq(demoOrders.tenantId, tenantId)).orderBy(desc(demoOrders.createdAt));
  const tenantRows = await db.select().from(tenants).where(eq(tenants.id, tenantId)).limit(1);
  const tenant = tenantRows[0];

  // Analytics
  const totalCalls = calls.length;
  const completed = calls.filter((c: any) => c.outcome === "completed").length;
  const escalated = calls.filter((c: any) => c.outcome === "escalated").length;
  const avgDur = totalCalls > 0 ? Math.round(calls.reduce((s: number, c: any) => s + (c.durationSeconds || 0), 0) / totalCalls) : 0;

  const batchData = [
    {
      range: "Call Logs!A2:I1000",
      values: calls.map((c: any) => [
        c.createdAt?.slice(0, 10) || "",
        c.callerNumber || "",
        c.direction || "inbound",
        c.durationSeconds || 0,
        c.outcome || "",
        c.summary || "",
        c.conversationId || "",
        tenant?.name || tenantId,
        c.createdAt || "",
      ]),
    },
    {
      range: "Bookings!A2:H1000",
      values: bkgs.map((b: any) => [
        b.createdAt?.slice(0, 10) || "",
        b.callerName || "",
        b.callerPhone || "",
        b.service || "",
        b.slotStart || "",
        b.slotEnd || "",
        b.status || "",
        b.googleEventId || "",
      ]),
    },
    {
      range: "Orders!A2:G1000",
      values: orders.map((o: any) => [
        o.orderNumber || "",
        o.customerName || "",
        o.customerPhone || "",
        o.itemsSummary || "",
        o.total || 0,
        o.status || "",
        o.expectedDelivery || "",
      ]),
    },
    {
      range: "Analytics!A2:B20",
      values: [
        ["Total Calls", totalCalls],
        ["Completed Calls", completed],
        ["Escalated Calls", escalated],
        ["Resolution Rate (%)", totalCalls > 0 ? Math.round((completed / totalCalls) * 100) : 0],
        ["Avg Duration (s)", avgDur],
        ["Total Bookings", bkgs.length],
        ["Total Orders", orders.length],
        ["Last Synced", new Date().toISOString()],
        ["Tenant", tenant?.name || tenantId],
        ["Plan", tenant?.plan || ""],
      ],
    },
  ];

  // Clear existing data rows first
  await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchClear`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
    body: JSON.stringify({ ranges: ["Call Logs!A2:Z1000", "Bookings!A2:Z1000", "Orders!A2:Z1000", "Analytics!A2:Z100"] }),
  });

  // Write fresh data
  await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchUpdate`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
    body: JSON.stringify({ valueInputOption: "RAW", data: batchData }),
  });

  return { rowsSynced: calls.length + bkgs.length + orders.length };
}

// ──────────────────────────────────────────
// ELEVENLABS CONVERSATIONS (transcripts + recordings)
// ──────────────────────────────────────────

// Fetch all ElevenLabs conversations for a tenant's agent
app.get("/tenants/:id/conversations", authenticatedOnly, async (c) => {
  const db = getDB();
  const tenantId = c.req.param("id");
  const ELEVENLABS_API_KEY = (env as any).ELEVENLABS_API_KEY || "";
  if (!ELEVENLABS_API_KEY) return c.json({ error: "Missing ELEVENLABS_API_KEY" }, 500);

  const rows = await db.select().from(tenants).where(eq(tenants.id, tenantId)).limit(1);
  if (!rows.length) return c.json({ error: "Not found" }, 404);
  const tenant = rows[0];
  if (!tenant.agentId) return c.json({ conversations: [] });

  const res = await fetch(
    `https://api.elevenlabs.io/v1/convai/conversations?agent_id=${tenant.agentId}&page_size=50`,
    { headers: { "xi-api-key": ELEVENLABS_API_KEY } }
  );
  if (!res.ok) return c.json({ conversations: [] });
  const data: any = await res.json();
  return c.json({ conversations: data.conversations || [] });
});

// Fetch single conversation detail with full transcript
app.get("/tenants/:id/conversations/:convId", authenticatedOnly, async (c) => {
  const ELEVENLABS_API_KEY = (env as any).ELEVENLABS_API_KEY || "";
  if (!ELEVENLABS_API_KEY) return c.json({ error: "Missing ELEVENLABS_API_KEY" }, 500);
  const convId = c.req.param("convId");

  const res = await fetch(`https://api.elevenlabs.io/v1/convai/conversations/${convId}`, {
    headers: { "xi-api-key": ELEVENLABS_API_KEY }
  });
  if (!res.ok) return c.json({ error: "Not found" }, 404);
  const data: any = await res.json();
  return c.json({ conversation: data });
});

// Proxy audio recording (avoids CORS + exposes API key on client)
app.get("/tenants/:id/conversations/:convId/audio", authenticatedOnly, async (c) => {
  const ELEVENLABS_API_KEY = (env as any).ELEVENLABS_API_KEY || "";
  if (!ELEVENLABS_API_KEY) return c.json({ error: "Missing key" }, 500);
  const convId = c.req.param("convId");

  const res = await fetch(`https://api.elevenlabs.io/v1/convai/conversations/${convId}/audio`, {
    headers: { "xi-api-key": ELEVENLABS_API_KEY }
  });
  if (!res.ok) return c.json({ error: "Audio not available" }, 404);

  const blob = await res.arrayBuffer();
  return new Response(blob, {
    headers: {
      "Content-Type": "audio/mpeg",
      "Content-Disposition": `inline; filename="${convId}.mp3"`,
    }
  });
});

// ──────────────────────────────────────────
// DELETE TENANT
// ──────────────────────────────────────────

app.delete("/tenants/:id", authenticatedOnly, async (c) => {
  const db = getDB();
  const id = c.req.param("id");
  await db.delete(tenants).where(eq(tenants.id, id));
  return c.json({ success: true });
});

// ──────────────────────────────────────────
// SEED DEMO DATA
// ──────────────────────────────────────────

app.post("/seed", async (c) => {
  const db = getDB();
  const now = new Date().toISOString();

  // Create 3 demo tenants
  const demoTenants = [
    { id: "demo-clinic-001", name: "City Clinic Delhi", vertical: "clinic", agentName: "Priya", agentLanguage: "hi", agentVoiceId: "1Z7Y8o9cvUeWq8oLKgMY", slug: "city-clinic-delhi" },
    { id: "demo-hotel-001", name: "The Grand Residency", vertical: "hotel", agentName: "Aria", agentLanguage: "en", agentVoiceId: "21m00Tcm4TlvDq8ikWAM", slug: "grand-residency" },
    { id: "demo-ecom-001", name: "Soul Store", vertical: "ecommerce", agentName: "Deepa", agentLanguage: "hi", agentVoiceId: "1Z7Y8o9cvUeWq8oLKgMY", slug: "soul-store" },
  ];

  for (const t of demoTenants) {
    const greeting = buildGreeting(t.vertical, t.agentName, t.name);
    await db.insert(tenants).values({
      ...t, plan: "growth", status: "active", agentStatus: "active",
      agentId: "", phoneNumberId: "", phoneNumber: "",
      agentGreeting: greeting,
      businessHoursStart: "09:00", businessHoursEnd: "21:00",
      timezone: "Asia/Kolkata", createdAt: now,
    }).onConflictDoNothing();
  }

  // Seed demo call logs
  const outcomes = ["completed", "completed", "completed", "escalated", "completed"];
  const callers = ["+919876543210", "+919876543211", "+918765432109", "+917654321098", "+916543210987"];
  const durations = [145, 89, 203, 67, 178];

  for (let i = 0; i < 20; i++) {
    const d = new Date();
    d.setDate(d.getDate() - Math.floor(i / 3));
    d.setHours(9 + (i % 8));
    await db.insert(callLogs).values({
      tenantId: demoTenants[i % 3].id,
      callerNumber: callers[i % 5],
      direction: "inbound",
      durationSeconds: durations[i % 5],
      outcome: outcomes[i % 5],
      summary: getSummary(demoTenants[i % 3].vertical),
      createdAt: d.toISOString(),
    }).onConflictDoNothing();
  }

  // Seed demo bookings for clinic + hotel
  const bookingData = [
    { tenantId: "demo-clinic-001", callerName: "Aarav Sharma", service: "General Consultation", slotStart: "2026-04-14T10:00:00.000Z" },
    { tenantId: "demo-clinic-001", callerName: "Priya Patel", service: "Follow-up", slotStart: "2026-04-14T11:00:00.000Z" },
    { tenantId: "demo-clinic-001", callerName: "Rohan Gupta", service: "Blood Test", slotStart: "2026-04-15T09:30:00.000Z" },
    { tenantId: "demo-hotel-001", callerName: "Sneha Reddy", service: "Room 204 — Deluxe", slotStart: "2026-04-20T14:00:00.000Z" },
    { tenantId: "demo-hotel-001", callerName: "Vikram Singh", service: "Room 301 — Suite", slotStart: "2026-04-22T14:00:00.000Z" },
  ];

  for (const b of bookingData) {
    await db.insert(bookings).values({ ...b, status: "confirmed", createdAt: now }).onConflictDoNothing();
  }

  // Seed demo orders for e-com
  const orders = [
    { orderNumber: "101", customerName: "Aarav Sharma", customerPhone: "+919876543210", status: "In Transit", itemsSummary: "Classic White Tee x2", total: 1598, expectedDelivery: "14 April 2026" },
    { orderNumber: "102", customerName: "Priya Patel", customerPhone: "+919876543211", status: "Delivered", itemsSummary: "Black Hoodie x1, Soul Cap x1", total: 3497, expectedDelivery: null },
    { orderNumber: "103", customerName: "Rohan Gupta", customerPhone: "+919876543212", status: "Processing", itemsSummary: "Denim Jacket x1", total: 4999, expectedDelivery: "18 April 2026" },
    { orderNumber: "104", customerName: "Sneha Reddy", customerPhone: "+919876543213", status: "Shipped", itemsSummary: "Summer Dress x1, Scarf x2", total: 2798, expectedDelivery: "16 April 2026" },
    { orderNumber: "105", customerName: "Vikram Singh", customerPhone: "+919876543214", status: "Cancelled", itemsSummary: "Leather Boots x1", total: 6999, expectedDelivery: null },
  ];

  for (const o of orders) {
    await db.insert(demoOrders).values({ tenantId: "demo-ecom-001", ...o, createdAt: now }).onConflictDoNothing();
  }

  // Create demo user via Better Auth
  const baseURL = `${new URL(c.req.url).protocol}//${new URL(c.req.url).host}`;
  const auth = createAuth(baseURL);
  try {
    await auth.api.signUpEmail({
      body: {
        email: "demo@voiceos.ai",
        password: "demo1234",
        name: "VoiceOS Demo",
      },
    });
  } catch (_e) {
    // User might already exist — ignore
  }
  // Promote demo user to super_admin so they see all demo tenants
  try {
    await db.update(userTable).set({ role: "super_admin" }).where(eq(userTable.email, "demo@voiceos.ai"));
  } catch (_e) {
    // Ignore — schema may not have role column
  }

  return c.json({ success: true, message: "Demo data seeded: 3 tenants, 20 call logs, 5 bookings, 5 orders, 1 demo user" });
});

// ──────────────────────────────────────────
// HELPERS
// ──────────────────────────────────────────

function buildGreeting(vertical: string, agentName: string, businessName: string): string {
  if (vertical === "clinic") return `नमस्ते! मैं ${agentName} हूँ, ${businessName} से। मैं आपकी कैसे मदद कर सकती हूँ?`;
  if (vertical === "hotel") return `Good day! Thank you for calling ${businessName}. I'm ${agentName}, how may I assist you?`;
  return `Hi! I'm ${agentName} from ${businessName}. How can I help you today?`;
}

function buildSystemPrompt(vertical: string, agentName: string, businessName: string): string {
  if (vertical === "clinic") {
    return `You are ${agentName}, a bilingual (Hindi/English) AI receptionist for ${businessName}.\nHandle: appointment booking, appointment status, clinic hours, doctor availability.\nFlow:\n1. Greet warmly in Hindi\n2. Ask how you can help\n3. If appointment booking: ask for name, preferred date/time → use check_availability tool → confirm slot → use book_appointment tool\n4. If checking appointment: ask for name/phone → look up in system\n5. For anything complex: "मैं डॉक्टर की team को callback arrange करती हूँ।" then use end_call\n6. Always end with end_call tool when conversation is complete\nSpeak Hindi primarily, switch to English if customer speaks English. Be warm, professional, brief.`;
  }
  if (vertical === "hotel") {
    return `You are ${agentName}, AI concierge for ${businessName}.\nHandle: room reservations, check-in/out info, F&B orders, housekeeping requests, local recommendations.\nFlow:\n1. Greet professionally\n2. Room booking: ask dates, guests, preference → check_availability → book_appointment\n3. Concierge requests: handle or escalate to front desk\n4. Always end with end_call when done\nSpeak English. Be warm, professional, concise.`;
  }
  return `You are ${agentName}, AI support agent for ${businessName}.\nHandle: order status, returns, delivery queries.\nFlow:\n1. Greet\n2. Ask for order number → use order_lookup tool\n3. Share status clearly\n4. Offer to help further\n5. End with end_call\nSpeak English and Hindi. Be helpful and brief.`;
}

function buildTools(vertical: string, tenantId: string, webhookBase: string): any[] {
  const endCall = {
    type: "system", name: "end_call",
    description: "End the call when conversation is complete or customer says goodbye/bye/thank you/dhanyawad.",
  };

  if (vertical === "clinic" || vertical === "hotel") {
    return [
      {
        type: "webhook", name: "check_availability",
        description: "Check available appointment/room slots for a given date.",
        api_schema: {
          url: `${webhookBase}/api/tenants/${tenantId}/tools/check-availability`,
          method: "POST",
          request_headers: { "Content-Type": "application/json" },
          request_body_schema: {
            type: "object",
            properties: { date: { type: "string", description: "Date in YYYY-MM-DD format, e.g. 2026-04-15" } },
            required: ["date"],
          },
        },
      },
      {
        type: "webhook", name: "book_appointment",
        description: "Book a confirmed appointment slot for the caller.",
        api_schema: {
          url: `${webhookBase}/api/tenants/${tenantId}/tools/book-appointment`,
          method: "POST",
          request_headers: { "Content-Type": "application/json" },
          request_body_schema: {
            type: "object",
            properties: {
              caller_name: { type: "string", description: "Full name of the caller" },
              caller_phone: { type: "string", description: "Caller phone number" },
              slot: { type: "string", description: "Confirmed time slot, e.g. '2026-04-15 10:00'" },
              service: { type: "string", description: "Type of appointment or service" },
            },
            required: ["caller_name", "slot"],
          },
        },
      },
      endCall,
    ];
  }

  return [
    {
      type: "webhook", name: "order_lookup",
      description: "Look up an order by order number.",
      api_schema: {
        url: `${webhookBase}/api/tenants/${tenantId}/tools/order-lookup`,
        method: "POST",
        request_headers: { "Content-Type": "application/json" },
        request_body_schema: {
          type: "object",
          properties: { order_number: { type: "string", description: "Order number e.g. 101" } },
          required: ["order_number"],
        },
      },
    },
    endCall,
  ];
}

async function refreshGoogleToken(integration: any, db: any, tenantId: string): Promise<string> {
  const expiry = integration.tokenExpiry ? new Date(integration.tokenExpiry) : null;
  if (!expiry || expiry > new Date(Date.now() + 60 * 1000)) return integration.accessToken;

  const CLIENT_ID = (env as any).GOOGLE_CLIENT_ID || "";
  const CLIENT_SECRET = (env as any).GOOGLE_CLIENT_SECRET || "";

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      refresh_token: integration.refreshToken || "",
      client_id: CLIENT_ID, client_secret: CLIENT_SECRET, grant_type: "refresh_token",
    }),
  });

  if (!res.ok) return integration.accessToken;
  const data: any = await res.json();
  const newExpiry = new Date(Date.now() + data.expires_in * 1000).toISOString();

  await db.update(integrations).set({
    accessToken: data.access_token,
    tokenExpiry: newExpiry,
    updatedAt: new Date().toISOString(),
  }).where(eq(integrations.tenantId, tenantId));

  return data.access_token;
}

function generateAvailableSlots(date: Date, busy: any[]): string[] {
  const slots: string[] = [];
  const hours = [9, 10, 11, 14, 15, 16, 17];
  for (const h of hours) {
    const slotStart = new Date(date);
    slotStart.setHours(h, 0, 0, 0);
    const slotEnd = new Date(slotStart.getTime() + 30 * 60 * 1000);
    const isBusy = busy.some(b => {
      const bStart = new Date(b.start);
      const bEnd = new Date(b.end);
      return slotStart < bEnd && slotEnd > bStart;
    });
    if (!isBusy) slots.push(`${h}:00 ${h < 12 ? "AM" : "PM"}`);
  }
  return slots;
}

function getMockSlots(date: string): string {
  const d = date ? new Date(date) : new Date();
  return `Available slots on ${formatDate(d)}: 10:00 AM, 11:00 AM, 2:00 PM, 3:30 PM. Which time works for you?`;
}

function formatDate(d: Date): string {
  return d.toLocaleDateString("en-IN", { weekday: "long", month: "long", day: "numeric" });
}

function formatSlotForSpeech(slot: string): string {
  if (!slot) return "the requested time";
  try {
    const d = new Date(slot.includes("T") ? slot : slot.replace(" ", "T"));
    return d.toLocaleDateString("en-IN", { weekday: "long", month: "long", day: "numeric" }) +
      " at " + d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
  } catch { return slot; }
}

function parseSlotToDateTime(slot: string): Date {
  try {
    if (slot.includes("T")) return new Date(slot);
    if (slot.match(/\d{4}-\d{2}-\d{2}/)) return new Date(slot.replace(" ", "T"));
    const d = new Date();
    const [h, m] = slot.replace(/[APM]/gi, "").trim().split(":").map(Number);
    const isPM = slot.toUpperCase().includes("PM") && h < 12;
    d.setHours(isPM ? h + 12 : h, m || 0, 0, 0);
    return d;
  } catch { return new Date(); }
}

function getSummary(vertical: string): string {
  if (vertical === "clinic") return ["Appointment booked for consultation", "Patient enquired about timings", "Follow-up appointment scheduled"][Math.floor(Math.random() * 3)];
  if (vertical === "hotel") return ["Room reservation confirmed", "Guest enquired about check-in time", "Concierge request handled"][Math.floor(Math.random() * 3)];
  return ["Order status checked — In Transit", "Return request initiated", "Delivery query resolved"][Math.floor(Math.random() * 3)];
}

export default app;
