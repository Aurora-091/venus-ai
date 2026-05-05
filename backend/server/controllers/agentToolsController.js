import { getIntegration } from "../models/repositories.js";

export function createAgentToolsController({ getCalendarClientForTenant }) {
  return {
    async checkAvailability(req, res) {
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

        const busyTimes = events.map((e) => {
          const start = e.start.dateTime || e.start.date;
          const end = e.end.dateTime || e.end.date;
          return `${start} to ${end}`;
        });

        res.json({
          result: `On ${requestedDate}, the following times are busy: ${busyTimes.join(", ")}. Please recommend an open slot outside of these hours.`,
        });
      } catch (e) {
        console.error("Calendar Check Availability Error:", e);
        res.json({ result: "I could not check the calendar right now due to a system error." });
      }
    },

    async bookAppointment(req, res) {
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
        const endTime = new Date(startTime.getTime() + 60 * 60 * 1000);

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
    },

    async orderLookup(req, res) {
      const orderNumber = req.body?.order_number || req.body?.orderNumber || "";
      if (!orderNumber) return res.json({ result: "Please provide your order number." });
      res.json({
        result: `Order ${orderNumber} is being processed. A support team member can share the latest delivery update if needed.`,
      });
    },
  };
}
