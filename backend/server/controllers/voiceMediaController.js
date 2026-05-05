import { createCallLog, findTenantById } from "../models/repositories.js";
import { isRealAgent, isRealPhoneNumber } from "../services/agentPrompts.js";

export function createVoiceMediaController(io) {
  return {
    async outboundCall(req, res) {
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
      const call = await createCallLog(
        {
          tenantId: req.params.id,
          callerNumber: toNumber,
          direction: "outbound",
          durationSeconds: 0,
          outcome: "initiated",
          summary: "Outbound call initiated through ElevenLabs",
          conversationId: data.conversation_id || "",
        },
        io
      );
      res.status(202).json({ success: true, conversation_id: data.conversation_id || "", call });
    },

    async listConversations(req, res) {
      const tenant = await findTenantById(req.params.id);
      if (!tenant) return res.status(404).json({ error: "Tenant not found" });

      const apiKey = process.env.ELEVENLABS_API_KEY || "";
      if (!apiKey || !isRealAgent(tenant)) {
        return res.json({ conversations: [] });
      }

      const conversationsRes = await fetch(
        `https://api.elevenlabs.io/v1/convai/conversations?agent_id=${tenant.agentId}&page_size=50`,
        { headers: { "xi-api-key": apiKey } }
      );

      if (!conversationsRes.ok) {
        return res.status(502).json({
          error: "Could not fetch ElevenLabs conversations",
          details: await conversationsRes.text(),
        });
      }

      const data = await conversationsRes.json();
      res.json({ conversations: data.conversations || [] });
    },

    async getConversation(req, res) {
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
    },

    async getConversationAudio(req, res) {
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
    },
  };
}
