import { useEffect, useState } from "react";
import { api } from "../../lib/api";

interface Props { tenant?: any; onTenantUpdate?: (t: any) => void; }

const VOICES = [
  { id: "1Z7Y8o9cvUeWq8oLKgMY", name: "Priya (Hindi Female)" },
  { id: "21m00Tcm4TlvDq8ikWAM", name: "Rachel (English Female)" },
  { id: "TxGEqnHWrfWFTfGW9XjX", name: "Josh (English Male)" },
  { id: "VR6AewLTigWG4xSOukaG", name: "Arnold (English Male)" },
  { id: "pNInz6obpgDQGcFmaJgB", name: "Adam (English Male)" },
];

export default function AgentStudio({ tenant, onTenantUpdate }: Props) {
  const [form, setForm] = useState({
    agentName: "", agentLanguage: "hi", agentVoiceId: "", agentGreeting: "",
    businessHoursStart: "09:00", businessHoursEnd: "20:00",
  });
  const [saving, setSaving] = useState(false);
  const [setting, setSetting] = useState(false);
  const [msg, setMsg] = useState("");
  const [msgType, setMsgType] = useState<"ok" | "err">("ok");
  const [widgetReady, setWidgetReady] = useState(false);

  useEffect(() => {
    if (!tenant) return;
    setForm({
      agentName: tenant.agentName || "",
      agentLanguage: tenant.agentLanguage || "hi",
      agentVoiceId: tenant.agentVoiceId || "",
      agentGreeting: tenant.agentGreeting || "",
      businessHoursStart: tenant.businessHoursStart || "09:00",
      businessHoursEnd: tenant.businessHoursEnd || "20:00",
    });
    setWidgetReady(false);
  }, [tenant?.id]);

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const showMsg = (m: string, t: "ok" | "err" = "ok") => {
    setMsg(m); setMsgType(t);
    setTimeout(() => setMsg(""), 4000);
  };

  const handleSave = async () => {
    if (!tenant?.id) return;
    setSaving(true);
    try {
      await api.patch(`/tenants/${tenant.id}`, form);
      showMsg("Agent settings saved.");
      onTenantUpdate?.({ ...tenant, ...form });
    } catch (e: any) {
      showMsg("Save failed: " + e.message, "err");
    }
    setSaving(false);
  };

  const handleSetupAgent = async () => {
    if (!tenant?.id) return;
    setSetting(true);
    try {
      const res = await api.post(`/tenants/${tenant.id}/setup-agent`, {
        webhook_base_url: window.location.origin,
      });
      showMsg(res.needsPhoneNumber
        ? `Agent created: ${res.agentId}. Add a real Twilio phone number to enable calls.`
        : `Agent created! ID: ${res.agentId}`);
      onTenantUpdate?.({
        ...tenant,
        agentId: res.agentId,
        phoneNumberId: res.phoneNumberId || tenant.phoneNumberId,
        phoneNumber: res.phoneNumber || tenant.phoneNumber,
        agentStatus: res.needsPhoneNumber ? "agent_created" : "active",
      });
    } catch (e: any) {
      showMsg("Setup failed: " + cleanError(e.message), "err");
    }
    setSetting(false);
  };

  if (!tenant) {
    return <div className="p-8 text-sm text-[#475569]">Select a workspace first.</div>;
  }

  const hasRealAgent = !!tenant.agentId && !tenant.agentId.startsWith("local-");
  const hasRealPhoneNumber = !!tenant.phoneNumberId && !tenant.phoneNumberId.startsWith("local-");
  const isConfigured = hasRealAgent;

  return (
    <div className="p-6 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-xl font-semibold">Agent Studio</h1>
        <p className="text-sm text-[#475569] mt-0.5">Configure your AI voice agent's personality and behaviour</p>
      </div>

      {/* Status */}
      <div className={`flex items-center justify-between rounded-2xl px-5 py-4 mb-6 border ${
        isConfigured
          ? "bg-emerald-500/5 border-emerald-500/20"
          : "bg-amber-500/5 border-amber-500/20"
      }`}>
        <div className="flex items-center gap-3">
          <div className={`w-2 h-2 rounded-full ${isConfigured ? "bg-emerald-400 pulse-live" : "bg-amber-400"}`} />
          <div>
            <div className={`text-sm font-medium ${isConfigured ? "text-emerald-300" : "text-amber-300"}`}>
              {isConfigured ? "Agent live" : "Agent not set up"}
            </div>
            <div className="text-xs text-[#94A3B8] mt-0.5">
              {isConfigured ? `ElevenLabs ID: ${tenant.agentId}` : "Connect ElevenLabs to activate voice calls"}
            </div>
          </div>
        </div>
        {!isConfigured && (
          <button
            onClick={handleSetupAgent}
            disabled={setting}
            className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs px-4 py-2 rounded-xl transition-colors"
          >
            {setting ? "Creating..." : "Create Agent"}
          </button>
        )}
        {isConfigured && (
          <button
            onClick={handleSetupAgent}
            disabled={setting}
            className="bg-[#1E2A3E] hover:bg-[#2A3A54] text-[#94A3B8] text-xs px-4 py-2 rounded-xl transition-colors"
          >
            {setting ? "Rebuilding..." : "Rebuild Agent"}
          </button>
        )}
      </div>

      {msg && (
        <div className={`mb-5 text-xs px-4 py-2.5 rounded-xl ${msgType === "ok" ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"}`}>
          {msg}
        </div>
      )}

      {/* Form */}
      <div className="bg-[#0F1623] border border-[#1E2A3E] rounded-2xl p-6 space-y-5">
        <h2 className="text-sm font-semibold text-[#94A3B8] uppercase tracking-wide">Personality</h2>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-[#94A3B8] mb-1.5">Agent Name</label>
            <input
              value={form.agentName}
              onChange={e => set("agentName", e.target.value)}
              placeholder="Priya"
              className="w-full bg-[#080C14] border border-[#1E2A3E] focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-[#475569] outline-none transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#94A3B8] mb-1.5">Language</label>
            <select
              value={form.agentLanguage}
              onChange={e => set("agentLanguage", e.target.value)}
              className="w-full bg-[#080C14] border border-[#1E2A3E] focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-sm text-white outline-none transition-colors"
            >
              <option value="hi">Hindi</option>
              <option value="en">English</option>
              <option value="hi-en">Hinglish</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-[#94A3B8] mb-1.5">Voice</label>
          <select
            value={form.agentVoiceId}
            onChange={e => set("agentVoiceId", e.target.value)}
            className="w-full bg-[#080C14] border border-[#1E2A3E] focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-sm text-white outline-none transition-colors"
          >
            {VOICES.map(v => (
              <option key={v.id} value={v.id}>{v.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-[#94A3B8] mb-1.5">Greeting message</label>
          <textarea
            value={form.agentGreeting}
            onChange={e => set("agentGreeting", e.target.value)}
            rows={3}
            placeholder="Namaste! City Clinic Delhi mein aapka swagat hai. Main Priya hun..."
            className="w-full bg-[#080C14] border border-[#1E2A3E] focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-[#475569] outline-none transition-colors resize-none"
          />
          <div className="text-xs text-[#475569] mt-1">This is the first thing your agent says when a call connects.</div>
        </div>

        <div className="pt-2 border-t border-[#1E2A3E]">
          <h2 className="text-sm font-semibold text-[#94A3B8] uppercase tracking-wide mb-4">Business Hours</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#94A3B8] mb-1.5">Opens at</label>
              <input
                type="time"
                value={form.businessHoursStart}
                onChange={e => set("businessHoursStart", e.target.value)}
                className="w-full bg-[#080C14] border border-[#1E2A3E] focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-sm text-white outline-none transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#94A3B8] mb-1.5">Closes at</label>
              <input
                type="time"
                value={form.businessHoursEnd}
                onChange={e => set("businessHoursEnd", e.target.value)}
                className="w-full bg-[#080C14] border border-[#1E2A3E] focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-sm text-white outline-none transition-colors"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm px-5 py-2.5 rounded-xl transition-colors font-medium"
          >
            {saving ? "Saving..." : "Save changes"}
          </button>
        </div>
      </div>

      {/* Phone number + ElevenLabs widget */}
      <div className="mt-5 grid grid-cols-2 gap-4">
        {hasRealPhoneNumber && tenant.phoneNumber && (
          <div className="bg-[#0F1623] border border-[#1E2A3E] rounded-2xl p-5">
            <div className="text-xs text-[#475569] mb-2 uppercase tracking-wide font-medium">Twilio Number</div>
            <div className="font-mono text-lg text-white">{tenant.phoneNumber}</div>
            <div className="text-xs text-[#475569] mt-1">Inbound calls → handled by your agent</div>
          </div>
        )}
        {hasRealAgent && (
          <div className="bg-[#0F1623] border border-[#1E2A3E] rounded-2xl p-5">
            <div className="text-xs text-[#475569] mb-2 uppercase tracking-wide font-medium">ElevenLabs Agent</div>
            <div className="font-mono text-sm text-white break-all">{tenant.agentId}</div>
            <a
              href={`https://elevenlabs.io/app/conversational-ai/agents/${tenant.agentId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 mt-2 text-xs text-blue-400 hover:text-blue-300 transition-colors"
            >
              Open in ElevenLabs →
            </a>
          </div>
        )}
      </div>

      {/* System prompt preview */}
      <div className="mt-4 bg-[#0F1623] border border-[#1E2A3E] rounded-2xl p-5">
        <div className="text-xs text-[#475569] mb-3 uppercase tracking-wide font-medium">System Prompt (auto-generated)</div>
        <div className="bg-[#080C14] rounded-xl p-4 font-mono text-xs text-[#475569] leading-relaxed whitespace-pre-wrap max-h-48 overflow-y-auto">
          {getSystemPromptPreview(tenant.vertical, form.agentName || tenant.agentName, tenant.name)}
        </div>
        <div className="text-xs text-[#2A3A54] mt-2">Rebuilt automatically when you click "Rebuild Agent"</div>
      </div>

      {/* ElevenLabs widget test */}
      {hasRealAgent && (
        <div className="mt-4 bg-[#0F1623] border border-[#1E2A3E] rounded-2xl p-5">
          <div className="text-xs text-[#475569] mb-3 uppercase tracking-wide font-medium">Test in Browser</div>
          <div className="text-xs text-[#475569] mb-3">Talk to your agent directly — uses the same AI, voice, and tools as a real call.</div>
          {widgetReady ? (
            <elevenlabs-convai key={tenant.agentId} agent-id={tenant.agentId} />
          ) : (
            <button
              onClick={() => setWidgetReady(true)}
              className="bg-blue-600 hover:bg-blue-500 text-white text-xs px-4 py-2 rounded-xl transition-colors"
            >
              Load browser test
            </button>
          )}
        </div>
      )}
      {!hasRealAgent && (
        <div className="mt-4 bg-amber-500/5 border border-amber-500/20 rounded-2xl p-5">
          <div className="text-xs text-amber-300 mb-2 uppercase tracking-wide font-medium">Browser Test Unavailable</div>
          <div className="text-xs text-[#94A3B8]">Create a real ElevenLabs agent first. Demo IDs like local-agent-* are local placeholders and cannot load the ElevenLabs widget.</div>
        </div>
      )}
    </div>
  );
}

function cleanError(raw: string): string {
  if (!raw) return "Request failed";
  try {
    const parsed = JSON.parse(raw);
    if (typeof parsed.error === "string" && typeof parsed.details === "string") {
      try {
        const details = JSON.parse(parsed.details);
        const messages = details.detail?.map((item: any) => item.msg).filter(Boolean);
        if (messages?.length) return `${parsed.error}: ${[...new Set(messages)].join("; ")}`;
      } catch {}
    }
    return parsed.error || raw;
  } catch {
    return raw;
  }
}

function getSystemPromptPreview(vertical: string, agentName: string, businessName: string): string {
  if (vertical === "clinic") {
    return `You are ${agentName}, a bilingual (Hindi/English) AI receptionist for ${businessName}.
Handle: appointment booking, appointment status, clinic hours, doctor availability.
Flow:
1. Greet warmly in Hindi
2. Ask how you can help
3. If appointment booking: ask name, preferred date/time → check_availability → confirm → book_appointment
4. For complex queries: arrange callback → end_call
Speak Hindi primarily, switch to English if needed.`;
  }
  if (vertical === "hotel") {
    return `You are ${agentName}, AI concierge for ${businessName}.
Handle: room reservations, check-in/out info, F&B orders, housekeeping, local recommendations.
Flow:
1. Greet professionally
2. Room booking: ask dates, guests, preference → check_availability → book_appointment
3. Concierge requests: handle or escalate
Speak English. Be warm, professional, concise.`;
  }
  return `You are ${agentName}, AI support agent for ${businessName}.
Handle: order status, returns, delivery queries.
Flow:
1. Greet
2. Ask for order number → order_lookup tool
3. Share status clearly
4. Offer further help → end_call`;
}
