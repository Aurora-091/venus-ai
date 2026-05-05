import {
  createTenant,
  deleteTenant,
  findTenantById,
  listTenants,
  updateTenant,
} from "../models/repositories.js";
import { buildGreeting, buildSystemPrompt, buildTools, isRealAgent } from "../services/agentPrompts.js";

export function createTenantController(io) {
  return {
    async list(req, res) {
      res.json({ tenants: await listTenants(req.user) });
    },

    async create(req, res) {
      const tenant = await createTenant(req.body, req.user);
      io.emit("tenant:created", tenant);
      res.status(201).json({ success: true, tenantId: tenant.id, tenant });
    },

    async patch(req, res) {
      const tenant = await updateTenant(req.params.id, req.body);
      if (!tenant) return res.status(404).json({ error: "Tenant not found" });
      io.to(req.params.id).emit("tenant:updated", tenant);
      res.json({ success: true, tenant });
    },

    async remove(req, res) {
      await deleteTenant(req.params.id);
      io.emit("tenant:deleted", { id: req.params.id });
      res.json({ success: true });
    },

    async setupAgent(req, res) {
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
              prompt: buildSystemPrompt(
                existingTenant.vertical,
                existingTenant.agentName || "Aria",
                existingTenant.name
              ),
              llm: "gemini-2.0-flash",
              tools: buildTools(existingTenant.vertical, req.params.id, webhookBase),
            },
            first_message:
              existingTenant.agentGreeting ||
              buildGreeting(existingTenant.vertical, existingTenant.agentName || "Aria", existingTenant.name),
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
    },
  };
}
