import { google } from "googleapis";
import { getIntegration } from "../models/repositories.js";

/**
 * Google Calendar OAuth (Node googleapis). Separate from Supabase Auth.
 */
export function createGoogleOAuth() {
  const oauthConfigured =
    Boolean(process.env.GOOGLE_CLIENT_ID) && Boolean(process.env.GOOGLE_CLIENT_SECRET);

  const googleOAuthRedirectUri =
    process.env.GOOGLE_OAUTH_REDIRECT_URI?.trim() ||
    "http://localhost:5000/api/auth/google/callback";

  const oauth2Client = oauthConfigured
    ? new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        googleOAuthRedirectUri
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

  return { oauth2Client, oauthConfigured, googleOAuthRedirectUri, getCalendarClientForTenant };
}
