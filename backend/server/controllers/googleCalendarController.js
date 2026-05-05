import { getIntegration, upsertIntegration } from "../models/repositories.js";

export function createGoogleCalendarController({ oauth2Client, oauthConfigured }) {
  return {
    async googleCallback(req, res) {
      const code = req.query.code;
      const tenantId = req.query.state;
      if (!code || !tenantId) return res.status(400).send("Invalid callback");
      if (!oauth2Client) {
        return res
          .status(503)
          .send(
            "<html><body><h1>Google OAuth not configured</h1><p>The server is missing GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET, so calendar connection is unavailable.</p></body></html>"
          );
      }

      try {
        const { tokens } = await oauth2Client.getToken(code);
        await upsertIntegration(tenantId, "google_calendar", {
          refresh_token: tokens.refresh_token,
          access_token: tokens.access_token,
          connected: true,
          calendar_id: "primary",
        });
        res.send(`
        <html>
          <body>
            <script>
              if (window.opener) {
                window.opener.postMessage({ type: "calendar_connected" }, "*");
                window.close();
              } else {
                const origin = "${process.env.CLIENT_ORIGIN || "http://127.0.0.1:5682"}";
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
    },

    getCalendarAuthUrl(req, res) {
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
        prompt: "consent",
        scope: ["https://www.googleapis.com/auth/calendar.events", "https://www.googleapis.com/auth/calendar.readonly"],
        state: req.params.id,
      });
      res.json({ url, configured: true });
    },

    async getCalendarStatus(req, res) {
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
    },

    async disconnectCalendar(req, res) {
      await upsertIntegration(req.params.id, "google_calendar", {
        connected: false,
        refresh_token: null,
        access_token: null,
      });
      res.json({ success: true });
    },
  };
}
