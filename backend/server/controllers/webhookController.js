import express from "express";
import { createCallLog, findTenantIdByPhoneNumber, normalizePhoneForLookup } from "../models/repositories.js";

export function createWebhookController(io) {
  return {
    twilioUrlEncoded: express.urlencoded({ extended: true }),
    twilioSecretGate(req, res, next) {
      const secret = process.env.TWILIO_WEBHOOK_SECRET;
      if (secret && req.headers["x-voiceos-secret"] !== secret) {
        return res.status(401).json({ error: "Invalid webhook secret" });
      }
      next();
    },
    async resolveInbound(req, res) {
      const to = req.body?.To || req.body?.Called || req.query?.to || "";
      const from = req.body?.From || req.body?.Caller || "";
      const tenantId = await findTenantIdByPhoneNumber(String(to));
      res.json({
        tenant_id: tenantId,
        matched_to: to,
        from,
        digits_to: normalizePhoneForLookup(String(to)),
      });
    },
    async voiceCallEvent(req, res) {
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
    },
  };
}
