import { Router } from "express";
import { createAgentToolsController } from "../controllers/agentToolsController.js";
import { createGoogleCalendarController } from "../controllers/googleCalendarController.js";
import { createSessionController } from "../controllers/sessionController.js";
import { createSheetsController } from "../controllers/sheetsController.js";
import { createTenantController } from "../controllers/tenantController.js";
import { createTenantStatsController } from "../controllers/tenantStatsController.js";
import { createVoiceMediaController } from "../controllers/voiceMediaController.js";
import { createWebhookController } from "../controllers/webhookController.js";
import { createGoogleOAuth } from "../config/googleOAuth.js";
import { requireAuth } from "../middlewares/auth.js";

export function createApiRouter(io) {
  const router = Router();
  const google = createGoogleOAuth();
  const session = createSessionController();
  const webhooks = createWebhookController(io);
  const googleCal = createGoogleCalendarController({
    oauth2Client: google.oauth2Client,
    oauthConfigured: google.oauthConfigured,
  });
  const tenants = createTenantController(io);
  const stats = createTenantStatsController();
  const tools = createAgentToolsController({ getCalendarClientForTenant: google.getCalendarClientForTenant });
  const voice = createVoiceMediaController(io);
  const sheets = createSheetsController();

  router.get("/ping", session.ping);

  router.post(
    "/twilio/resolve-inbound",
    webhooks.twilioUrlEncoded,
    webhooks.twilioSecretGate,
    webhooks.resolveInbound
  );

  router.post("/internal/voice/call-event", webhooks.voiceCallEvent);

  router.get("/auth/google/callback", googleCal.googleCallback);

  router.use(requireAuth);

  router.get("/me", session.me);
  router.get("/tenants", tenants.list);
  router.post("/tenants", tenants.create);
  router.patch("/tenants/:id", tenants.patch);
  router.delete("/tenants/:id", tenants.remove);
  router.post("/tenants/:id/setup-agent", tenants.setupAgent);

  router.get("/tenants/:id/calls", stats.listCalls);
  router.get("/tenants/:id/bookings", stats.listBookings);
  router.get("/tenants/:id/orders", stats.listOrders);
  router.get("/tenants/:id/analytics", stats.analytics);

  router.post("/tenants/:id/tools/check-availability", tools.checkAvailability);
  router.post("/tenants/:id/tools/book-appointment", tools.bookAppointment);
  router.post("/tenants/:id/tools/order-lookup", tools.orderLookup);

  router.post("/tenants/:id/outbound-call", voice.outboundCall);
  router.get("/tenants/:id/conversations", voice.listConversations);
  router.get("/tenants/:id/conversations/:convId", voice.getConversation);
  router.get("/tenants/:id/conversations/:convId/audio", voice.getConversationAudio);

  router.get("/tenants/:id/calendar/auth-url", googleCal.getCalendarAuthUrl);
  router.get("/tenants/:id/calendar/status", googleCal.getCalendarStatus);
  router.delete("/tenants/:id/calendar", googleCal.disconnectCalendar);

  router.get("/tenants/:id/sheets/status", sheets.status);
  router.post("/tenants/:id/sheets/create", sheets.create);
  router.post("/tenants/:id/sheets/link", sheets.link);
  router.post("/tenants/:id/sheets/sync", sheets.sync);
  router.delete("/tenants/:id/sheets", sheets.remove);

  return router;
}
