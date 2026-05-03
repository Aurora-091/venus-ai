import { Router } from "express";
import express from "express";
import { google } from "googleapis";
import {
  createCallLog,
  createTenant,
  deleteTenant,
  findTenantById,
  findTenantIdByPhoneNumber,
  getAnalytics,
  listBookings,
  listCalls,
  listOrders,
  listTenants,
  normalizePhoneForLookup,
  updateTenant,
  upsertIntegration,
  getIntegration,
} from "../services/repositories.js";
import { requireAuth } from "../middleware/auth.js";

export function createApiRouter(io) {
  const router = Router();

  const oauthConfigured =
    Boolean(process.env.GOOGLE_CLIENT_ID) && Boolean(process.env.GOOGLE_CLIENT_SECRET);

  const oauth2Client = oauthConfigured
    ? new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        "http://localhost:5000/api/auth/google/callback"
      )
    : null;

  function getCalendarClientForTenant(tenantId) {
    return getIntegration(tenantId, "google_calendar").then((integration) => {
      if (!oauth2Client || !integration?.connected || !integration.refresh_token) {
        return null;
      }
      oauth2Client.setCredentials({ refresh_token: integration.refresh_token });
      return google.calendar({ version: "v3", auth: oauth2Client });
    });
  }

  router.get("/ping", (_req, res) => {
    res.json({ ok: true, stack: "mern", ts: Date.now() });
  });

  /**
   * Vision Phase 2 — map inbound Twilio number → tenant (configure as Twilio HTTP webhook / Studio HTTP request).
   * Optional: set TWILIO_WEBHOOK_SECRET and send header X-VoiceOS-Secret.
   */
  router.post(
    "/twilio/resolve-inbound",
    express.urlencoded({ extended: true }),
    (req, res, next) => {
      const secret = process.env.TWILIO_WEBHOOK_SECRET;
      if (secret && req.headers["x-voiceos-secret"] !== secret) {
        return res.status(401).json({ error: "Invalid webhook secret" });
      }
      next();
    },
    async (req, res) => {
      const to = req.body?.To || req.body?.Called || req.query?.to || "";
      const from = req.body?.From || req.body?.Caller || "";
      const tenantId = await findTenantIdByPhoneNumber(String(to));
      res.json({
        tenant_id: tenantId,
        matched_to: to,
        from,
        digits_to: normalizePhoneForLookup(String(to)),
      });
    }
  );

  /**
   * Internal webhook (ElevenLabs post-call, custom bridges). Inserts call_logs and notifies Socket.IO room.
   * Set INTERNAL_WEBHOOK_SECRET and send Authorization: Bearer <secret>.
   */
  router.post("/internal/voice/call-event", async (req, res) => {
    const expected = process.env.INTERNAL_WEBHOOK_SECRET;
    const auth = req.headers.authorization || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
    if (expected && token !== expected) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const {
      tenant_id: tenantId,
      tenantId: tid,
      caller_number: callerNumber,
      callerNumber: cn,
      direction = "inbound",
      duration_seconds: durationSeconds,
      durationSeconds: ds,
      outcome = "completed",
      summary = "",
      conversation_id: conversationId,
      conversationId: cid,
    } = req.body || {};
    const tId = tenantId || tid;
    if (!tId) return res.status(400).json({ error: "tenant_id required" });

    try {
      const call = await createCallLog(
        {
          tenantId: tId,
          callerNumber: callerNumber || cn || "",
          direction,
          durationSeconds: Number(durationSeconds ?? ds ?? 0) || 0,
          outcome,
          summary: summary || "",
          conversationId: conversationId || cid || "",
        },
        io
      );
      res.status(201).json({ success: true, call });
    } catch (e) {
      console.error("[voice/call-event]", e);
      res.status(500).json({ error: String(e?.message || e) });
    }
  });

  // Open callbacks
  router.get("/auth/google/callback", async (req, res) => {
    const code = req.query.code;
    const tenantId = req.query.state;
    if (!code || !tenantId) return res.status(400).send("Invalid callback");
    if (!oauth2Client) {
      return res.status(503).send("Google OAuth is not configured on this server.");
    }

    try {
      const { tokens } = await oauth2Client.getToken(code);
      await upsertIntegration(tenantId, "google_calendar", {
        refresh_token: tokens.refresh_token,
        access_token: tokens.access_token,
        connected: true,
        calendar_id: "primary"
      });
      res.send(`
        <html>
          <body>
            <script>
              if (window.opener) {
                window.opener.postMessage({ type: "calendar_connected" }, "*");
                window.close();
              } else {
                const origin = "${process.env.CLIENT_ORIGIN || 'http://127.0.0.1:5682'}";
                window.location.href = origin + "/dashboard?tenant=${tenantId}&calendar=success";
              }
            </script>
            <p>Connected securely! You can close this window.</p>
          </body>
        </html>
      `);
    } catch (e) {
      console.error("Google Auth Error:", e);
      res.status(500).send("Google authentication failed");
    }
  });

  router.use(requireAuth);

  router.get("/me", (req, res) => {
    res.json({ user: req.user });
  });

  router.get("/tenants", async (req, res) => {
    res.json({ tenants: await listTenants(req.user) });
  });

  router.post("/tenants", async (req, res) => {
    const tenant = await createTenant(req.body, req.user);
    io.emit("tenant:created", tenant);
    res.status(201).json({ success: true, tenantId: tenant.id, tenant });
  });

  router.patch("/tenants/:id", async (req, res) => {
    const tenant = await updateTenant(req.params.id, req.body);
    if (!tenant) return res.status(404).json({ error: "Tenant not found" });
    io.to(req.params.id).emit("tenant:updated", tenant);
    res.json({ success: true, tenant });
  });

  router.delete("/tenants/:id", async (req, res) => {
    await deleteTenant(req.params.id);
    io.emit("tenant:deleted", { id: req.params.id });
    res.json({ success: true });
  });

  router.post("/tenants/:id/setup-agent", async (req, res) => {
    const existingTenant = await findTenantById(req.params.id);
    if (!existingTenant) return res.status(404).json({ error: "Tenant not found" });

    if (isRealAgent(existingTenant)) {
      return res.json({
        success: true,
        agentId: existingTenant.agentId,
        phoneNumberId: existingTenant.phoneNumberId,
        phoneNumber: existingTenant.phoneNumber,
      });
    }

    const apiKey = process.env.ELEVENLABS_API_KEY || "";
    if (!apiKey) {
      return res.status(400).json({
        error: "ELEVENLABS_API_KEY is missing in backend/.env. Add it, restart the backend, then create the agent again.",
      });
    }

    const webhookBase = req.body?.webhook_base_url || `${req.protocol}://${req.get("host")}`;
    const agentPayload = {
      name: `${existingTenant.name} - ${existingTenant.agentName || "Aria"}`,
      conversation_config: {
        agent: {
          prompt: {
            prompt: buildSystemPrompt(existingTenant.vertical, existingTenant.agentName || "Aria", existingTenant.name),
            llm: "gemini-2.0-flash",
            tools: buildTools(existingTenant.vertical, req.params.id, webhookBase),
          },
          first_message: existingTenant.agentGreeting || buildGreeting(existingTenant.vertical, existingTenant.agentName || "Aria", existingTenant.name),
          language: existingTenant.agentLanguage || "en",
        },
        tts: {
          voice_id: existingTenant.agentVoiceId || "21m00Tcm4TlvDq8ikWAM",
          model_id: existingTenant.agentLanguage === "en" ? "eleven_flash_v2" : "eleven_flash_v2_5",
        },
      },
    };

    const agentRes = await fetch("https://api.elevenlabs.io/v1/convai/agents/create", {
      method: "POST",
      headers: { "Content-Type": "application/json", "xi-api-key": apiKey },
      body: JSON.stringify(agentPayload),
    });

    if (!agentRes.ok) {
      return res.status(502).json({
        error: "ElevenLabs could not create the agent",
        details: await agentRes.text(),
      });
    }

    const agentData = await agentRes.json();
    const agentId = agentData.agent_id;
    const update = { agentId, agentStatus: "agent_created" };

    const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER || "";
    if (twilioPhoneNumber) {
      const phoneRes = await fetch("https://api.elevenlabs.io/v1/convai/phone-numbers", {
        method: "POST",
        headers: { "Content-Type": "application/json", "xi-api-key": apiKey },
        body: JSON.stringify({
          phone_number: twilioPhoneNumber,
          label: `${existingTenant.name} Support`,
          sid: process.env.TWILIO_ACCOUNT_SID || "",
          token: process.env.TWILIO_AUTH_TOKEN || "",
          provider: "twilio",
          agent_id: agentId,
        }),
      });

      if (phoneRes.ok) {
        const phoneData = await phoneRes.json();
        update.phoneNumberId = phoneData.phone_number_id || "";
        update.phoneNumber = twilioPhoneNumber;
        update.agentStatus = update.phoneNumberId ? "active" : "agent_created";
      }
    }

    const tenant = await updateTenant(req.params.id, update);
    io.to(req.params.id).emit("tenant:updated", tenant);
    res.json({
      success: true,
      agentId,
      phoneNumberId: tenant?.phoneNumberId || "",
      phoneNumber: tenant?.phoneNumber || "",
      needsPhoneNumber: !tenant?.phoneNumberId,
    });
  });

  router.get("/tenants/:id/calls", async (req, res) => {
    res.json({ calls: await listCalls(req.params.id) });
  });

  router.get("/tenants/:id/bookings", async (req, res) => {
    res.json({ bookings: await listBookings(req.params.id) });
  });

  router.get("/tenants/:id/orders", async (req, res) => {
    res.json({ orders: await listOrders(req.params.id) });
  });

  router.get("/tenants/:id/analytics", async (req, res) => {
    res.json(await getAnalytics(req.params.id));
  });

  router.post("/tenants/:id/tools/check-availability", async (req, res) => {
    const requestedDate = req.body?.date || req.body?.requested_date;
    if (!requestedDate) {
      return res.json({ result: "Please provide a valid date to check availability." });
    }

    try {
      const integration = await getIntegration(req.params.id, "google_calendar");
      if (!integration?.connected || !integration.refresh_token) {
        return res.json({ result: "Google Calendar is not connected. I cannot check availability right now." });
      }

      const calendar = await getCalendarClientForTenant(req.params.id);
      if (!calendar) {
        return res.json({ result: "Google Calendar OAuth is not configured on the server." });
      }

      const timeMin = new Date(`${requestedDate}T00:00:00.000Z`);
      const timeMax = new Date(`${requestedDate}T23:59:59.999Z`);

      const response = await calendar.events.list({
        calendarId: integration.calendar_id || "primary",
        timeMin: timeMin.toISOString(),
        timeMax: timeMax.toISOString(),
        singleEvents: true,
        orderBy: "startTime",
      });

      const events = response.data.items || [];
      if (events.length === 0) {
        return res.json({ result: `There are no scheduled events on ${requestedDate}. All slots are available.` });
      }

      const busyTimes = events.map(e => {
        const start = e.start.dateTime || e.start.date;
        const end = e.end.dateTime || e.end.date;
        return `${start} to ${end}`;
      });

      res.json({ result: `On ${requestedDate}, the following times are busy: ${busyTimes.join(", ")}. Please recommend an open slot outside of these hours.` });
    } catch (e) {
      console.error("Calendar Check Availability Error:", e);
      res.json({ result: "I could not check the calendar right now due to a system error." });
    }
  });

  router.post("/tenants/:id/tools/book-appointment", async (req, res) => {
    const callerName = req.body?.caller_name || req.body?.name || "the caller";
    const slot = req.body?.slot || req.body?.time;
    const service = req.body?.service || "General Appointment";

    if (!slot) {
      return res.json({ result: "Please specify an exact date and time for the appointment." });
    }

    try {
      const integration = await getIntegration(req.params.id, "google_calendar");
      if (!integration?.connected || !integration.refresh_token) {
        return res.json({ result: "Google Calendar is not connected. I cannot book the appointment right now." });
      }

      const calendar = await getCalendarClientForTenant(req.params.id);
      if (!calendar) {
        return res.json({ result: "Google Calendar OAuth is not configured on the server." });
      }

      const startTime = new Date(slot);
      const endTime = new Date(startTime.getTime() + 60 * 60 * 1000); // 1 hour duration

      await calendar.events.insert({
        calendarId: integration.calendar_id || "primary",
        requestBody: {
          summary: `${service} - ${callerName}`,
          start: { dateTime: startTime.toISOString() },
          end: { dateTime: endTime.toISOString() },
        },
      });

      res.json({
        result: `Appointment successfully booked for ${callerName} at ${slot}. Event created on Google Calendar!`,
      });
    } catch (e) {
      console.error("Calendar Booking Error:", e);
      res.json({ result: "Failed to book the appointment due to a system error." });
    }
  });

  router.post("/tenants/:id/tools/order-lookup", async (req, res) => {
    const orderNumber = req.body?.order_number || req.body?.orderNumber || "";
    if (!orderNumber) return res.json({ result: "Please provide your order number." });
    res.json({
      result: `Order ${orderNumber} is being processed. A support team member can share the latest delivery update if needed.`,
    });
  });

  router.post("/tenants/:id/outbound-call", async (req, res) => {
    const tenant = await findTenantById(req.params.id);
    if (!tenant) return res.status(404).json({ error: "Tenant not found" });

    const apiKey = process.env.ELEVENLABS_API_KEY || "";
    if (!apiKey) {
      return res.status(400).json({
        error: "Outbound calling is not configured. Add ELEVENLABS_API_KEY, then configure a real ElevenLabs agent and phone number.",
      });
    }

    if (!isRealAgent(tenant) || !isRealPhoneNumber(tenant)) {
      return res.status(400).json({
        error: "This tenant does not have a real ElevenLabs agent phone number yet. Configure the agent before placing outbound calls.",
      });
    }

    const toNumber = req.body?.to_number || "";
    const outboundRes = await fetch("https://api.elevenlabs.io/v1/convai/twilio/outbound-call", {
      method: "POST",
      headers: { "Content-Type": "application/json", "xi-api-key": apiKey },
      body: JSON.stringify({
        agent_id: tenant.agentId,
        agent_phone_number_id: tenant.phoneNumberId,
        to_number: toNumber,
      }),
    });

    if (!outboundRes.ok) {
      return res.status(502).json({
        error: "ElevenLabs could not start the outbound call",
        details: await outboundRes.text(),
      });
    }

    const data = await outboundRes.json();
    const call = await createCallLog({
      tenantId: req.params.id,
      callerNumber: toNumber,
      direction: "outbound",
      durationSeconds: 0,
      outcome: "initiated",
      summary: "Outbound call initiated through ElevenLabs",
      conversationId: data.conversation_id || "",
    }, io);
    io.to(req.params.id).emit("call:created", call);
    res.status(202).json({ success: true, conversation_id: data.conversation_id || "", call });
  });

  router.get("/tenants/:id/conversations", async (req, res) => {
    const tenant = await findTenantById(req.params.id);
    if (!tenant) return res.status(404).json({ error: "Tenant not found" });

    const apiKey = process.env.ELEVENLABS_API_KEY || "";
    if (!apiKey || !isRealAgent(tenant)) {
      return res.json({ conversations: [] });
    }

    const conversationsRes = await fetch(
      `https://api.elevenlabs.io/v1/convai/conversations?agent_id=${tenant.agentId}&page_size=50`,
      { headers: { "xi-api-key": apiKey } },
    );

    if (!conversationsRes.ok) {
      return res.status(502).json({
        error: "Could not fetch ElevenLabs conversations",
        details: await conversationsRes.text(),
      });
    }

    const data = await conversationsRes.json();
    res.json({ conversations: data.conversations || [] });
  });

  router.get("/tenants/:id/conversations/:convId", async (req, res) => {
    const apiKey = process.env.ELEVENLABS_API_KEY || "";
    if (!apiKey) return res.status(400).json({ error: "Missing ELEVENLABS_API_KEY" });

    const conversationRes = await fetch(`https://api.elevenlabs.io/v1/convai/conversations/${req.params.convId}`, {
      headers: { "xi-api-key": apiKey },
    });

    if (!conversationRes.ok) {
      return res.status(502).json({
        error: "Could not fetch ElevenLabs conversation",
        details: await conversationRes.text(),
      });
    }

    res.json({ conversation: await conversationRes.json() });
  });

  router.get("/tenants/:id/conversations/:convId/audio", async (req, res) => {
    const apiKey = process.env.ELEVENLABS_API_KEY || "";
    if (!apiKey) return res.status(400).json({ error: "Missing ELEVENLABS_API_KEY" });

    const audioRes = await fetch(`https://api.elevenlabs.io/v1/convai/conversations/${req.params.convId}/audio`, {
      headers: { "xi-api-key": apiKey },
    });

    if (!audioRes.ok) {
      return res.status(502).json({
        error: "Could not fetch ElevenLabs audio",
        details: await audioRes.text(),
      });
    }

    const audio = Buffer.from(await audioRes.arrayBuffer());
    res.setHeader("Content-Type", audioRes.headers.get("content-type") || "audio/mpeg");
    res.setHeader("Content-Disposition", `inline; filename="${req.params.convId}.mp3"`);
    res.send(audio);
  });

  router.get("/tenants/:id/calendar/auth-url", (_req, res) => {
    if (!oauth2Client) {
      return res.status(503).json({
        url: null,
        configured: false,
        error:
          "Google OAuth is not configured. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in backend/.env.",
      });
    }
    const url = oauth2Client.generateAuthUrl({
      access_type: "offline",
      prompt: "consent", // Force to always get a refresh_token
      scope: ["https://www.googleapis.com/auth/calendar.events", "https://www.googleapis.com/auth/calendar.readonly"],
      state: _req.params.id,
    });
    res.json({ url, configured: true });
  });

  router.get("/tenants/:id/calendar/status", async (req, res) => {
    if (!oauthConfigured) {
      return res.json({
        connected: false,
        calendarId: "primary",
        oauthConfigured: false,
        message:
          "Google Calendar OAuth is not configured on the server (missing GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET).",
      });
    }
    const integration = await getIntegration(req.params.id, "google_calendar");
    if (integration?.connected) {
      res.json({
        connected: true,
        calendarId: integration.calendar_id,
        oauthConfigured: true,
      });
    } else {
      res.json({
        connected: false,
        calendarId: "primary",
        oauthConfigured: true,
      });
    }
  });

  router.delete("/tenants/:id/calendar", async (req, res) => {
    await upsertIntegration(req.params.id, "google_calendar", {
      connected: false,
      refresh_token: null,
      access_token: null
    });
    res.json({ success: true });
  });

  router.get("/tenants/:id/sheets/status", (_req, res) => {
    res.json({ connected: false });
  });

  router.post("/tenants/:id/sheets/create", (_req, res) => {
    res.json({ success: false, error: "Google Sheets is not configured in the MERN backend yet" });
  });

  router.post("/tenants/:id/sheets/link", (_req, res) => {
    res.json({ success: true });
  });

  router.post("/tenants/:id/sheets/sync", (_req, res) => {
    res.json({ success: true, rowsSynced: 0 });
  });

  router.delete("/tenants/:id/sheets", (_req, res) => {
    res.json({ success: true });
  });

  return router;
}

function isRealAgent(tenant) {
  return Boolean(tenant?.agentId && !tenant.agentId.startsWith("local-"));
}

function isRealPhoneNumber(tenant) {
  return Boolean(tenant?.phoneNumberId && !tenant.phoneNumberId.startsWith("local-"));
}

function buildGreeting(vertical, agentName, businessName) {
  if (vertical === "clinic") return `Namaste! Main ${agentName} hoon, ${businessName} se. Main aapki kaise madad kar sakti hoon?`;
  if (vertical === "hotel") return `Good day! Thank you for calling ${businessName}. I'm ${agentName}, how may I assist you?`;
  return `Hi! I'm ${agentName} from ${businessName}. How can I help you today?`;
}

function buildSystemPrompt(vertical, agentName, businessName) {
  if (vertical === "clinic") {
    return `You are ${agentName}, a bilingual Hindi/English AI receptionist for ${businessName}. Handle appointment booking, appointment status, clinic hours, and doctor availability. Be warm, professional, and brief.`;
  }
  if (vertical === "hotel") {
    return `You are ${agentName}, an AI concierge for ${businessName}. Handle room reservations, check-in questions, housekeeping requests, and local recommendations. Be warm, professional, and concise.`;
  }
  return `You are ${agentName}, an AI support agent for ${businessName}. Handle order status, returns, and delivery queries. Be helpful and brief.`;
}

function buildTools(vertical, tenantId, webhookBase) {
  const endCall = {
    type: "system",
    name: "end_call",
    description: "End the call when the conversation is complete or the customer says goodbye.",
  };

  if (vertical === "clinic" || vertical === "hotel") {
    return [
      {
        type: "webhook",
        name: "check_availability",
        description: "Check available appointment or room slots for a given date.",
        api_schema: {
          url: `${webhookBase}/api/tenants/${tenantId}/tools/check-availability`,
          method: "POST",
          request_headers: { "Content-Type": "application/json" },
          request_body_schema: {
            type: "object",
            properties: { date: { type: "string", description: "Date in YYYY-MM-DD format" } },
            required: ["date"],
          },
        },
      },
      {
        type: "webhook",
        name: "book_appointment",
        description: "Book a confirmed appointment slot for the caller.",
        api_schema: {
          url: `${webhookBase}/api/tenants/${tenantId}/tools/book-appointment`,
          method: "POST",
          request_headers: { "Content-Type": "application/json" },
          request_body_schema: {
            type: "object",
            properties: {
              caller_name: { type: "string", description: "Full name of the caller" },
              caller_phone: { type: "string", description: "Phone number of the caller, including country code if available" },
              slot: { type: "string", description: "Confirmed appointment time slot, such as 2026-04-18 10:00" },
              service: { type: "string", description: "Requested appointment or service type" },
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
      type: "webhook",
      name: "order_lookup",
      description: "Look up an order by order number.",
      api_schema: {
        url: `${webhookBase}/api/tenants/${tenantId}/tools/order-lookup`,
        method: "POST",
        request_headers: { "Content-Type": "application/json" },
        request_body_schema: {
          type: "object",
          properties: { order_number: { type: "string", description: "Customer order number to look up" } },
          required: ["order_number"],
        },
      },
    },
    endCall,
  ];
}
