import { useState } from "react";
import { api } from "../lib/api";

const STEPS = ["Vertical", "Details", "Agent", "Connect", "Done"];

const VERTICALS = [
  { id: "clinic", icon: "🏥", title: "Clinic / Hospital", desc: "Appointment booking, doctor availability, patient queries", color: "border-emerald-500/40 bg-emerald-500/5 hover:border-emerald-400" },
  { id: "hotel", icon: "🏨", title: "Hotel / Hospitality", desc: "Room reservations, concierge, housekeeping requests", color: "border-blue-500/40 bg-blue-500/5 hover:border-blue-400" },
  { id: "ecommerce", icon: "🛍️", title: "E-commerce / D2C", desc: "Order status, returns, delivery queries", color: "border-violet-500/40 bg-violet-500/5 hover:border-violet-400" },
];

const VOICES = [
  { id: "1Z7Y8o9cvUeWq8oLKgMY", name: "Priya (Hindi Female)", lang: "hi" },
  { id: "21m00Tcm4TlvDq8ikWAM", name: "Rachel (English Female)", lang: "en" },
  { id: "TxGEqnHWrfWFTfGW9XjX", name: "Josh (English Male)", lang: "en" },
];

export default function Onboarding() {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [tenantId, setTenantId] = useState("");
  const [form, setForm] = useState({
    vertical: "", name: "", agentName: "", agentLanguage: "hi",
    agentVoiceId: "1Z7Y8o9cvUeWq8oLKgMY", businessHoursStart: "09:00", businessHoursEnd: "20:00",
  });

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const createTenant = async () => {
    setLoading(true);
    try {
      const res = await api.post("/tenants", form);
      setTenantId(res.tenantId);
      setStep(3);
    } catch (e: any) {
      alert("Failed: " + e.message);
    }
    setLoading(false);
  };

  const setupAgent = async () => {
    setLoading(true);
    try {
      await api.post(`/tenants/${tenantId}/setup-agent`, {
        webhook_base_url: window.location.origin,
      });
      setStep(4);
    } catch (e: any) {
      alert("Agent setup failed: " + e.message);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#080C14] flex items-center justify-center px-4">
      <div className="w-full max-w-2xl">
        {/* Steps */}
        <div className="flex items-center gap-2 mb-10 justify-center">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium transition-all ${
                i < step ? "bg-emerald-500 text-white" : i === step ? "bg-blue-600 text-white" : "bg-[#1E2A3E] text-[#475569]"
              }`}>
                {i < step ? "✓" : i + 1}
              </div>
              {i < STEPS.length - 1 && (
                <div className={`w-8 h-px ${i < step ? "bg-emerald-500/50" : "bg-[#1E2A3E]"}`} />
              )}
            </div>
          ))}
        </div>

        <div className="bg-[#0F1623] border border-[#1E2A3E] rounded-2xl p-8 animate-fade-in">

          {/* Step 0: Pick vertical */}
          {step === 0 && (
            <div>
              <h2 className="text-2xl font-normal mb-1" style={{ fontFamily: "'Instrument Serif', serif" }}>What kind of business is this for?</h2>
              <p className="text-sm text-[#94A3B8] mb-6">Choose your industry — each comes with a pre-built agent template</p>
              <div className="space-y-3">
                {VERTICALS.map(v => (
                  <button
                    key={v.id}
                    onClick={() => { set("vertical", v.id); setStep(1); }}
                    className={`w-full flex items-start gap-4 p-4 rounded-xl border transition-all text-left ${v.color}`}
                  >
                    <span className="text-2xl">{v.icon}</span>
                    <div>
                      <div className="font-medium text-sm">{v.title}</div>
                      <div className="text-xs text-[#94A3B8] mt-0.5">{v.desc}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 1: Business details */}
          {step === 1 && (
            <div>
              <h2 className="text-2xl font-normal mb-1" style={{ fontFamily: "'Instrument Serif', serif" }}>Tell us about your business</h2>
              <p className="text-sm text-[#94A3B8] mb-6">This personalises your agent's responses</p>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-[#94A3B8] block mb-1.5">Business name *</label>
                  <input value={form.name} onChange={e => set("name", e.target.value)} placeholder="e.g. City Clinic Delhi" className="w-full bg-[#080C14] border border-[#1E2A3E] focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-[#475569] outline-none transition-colors" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-[#94A3B8] block mb-1.5">Opening time</label>
                    <input type="time" value={form.businessHoursStart} onChange={e => set("businessHoursStart", e.target.value)} className="w-full bg-[#080C14] border border-[#1E2A3E] focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-sm text-white outline-none" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-[#94A3B8] block mb-1.5">Closing time</label>
                    <input type="time" value={form.businessHoursEnd} onChange={e => set("businessHoursEnd", e.target.value)} className="w-full bg-[#080C14] border border-[#1E2A3E] focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-sm text-white outline-none" />
                  </div>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setStep(0)} className="px-4 py-2.5 text-sm text-[#94A3B8] border border-[#1E2A3E] rounded-xl hover:border-[#2A3A54] transition-colors">Back</button>
                <button onClick={() => form.name && setStep(2)} className="flex-1 bg-blue-600 hover:bg-blue-500 transition-colors text-white font-medium py-2.5 rounded-xl text-sm disabled:opacity-50" disabled={!form.name}>Continue</button>
              </div>
            </div>
          )}

          {/* Step 2: Agent config */}
          {step === 2 && (
            <div>
              <h2 className="text-2xl font-normal mb-1" style={{ fontFamily: "'Instrument Serif', serif" }}>Customise your AI agent</h2>
              <p className="text-sm text-[#94A3B8] mb-6">Give your agent a name and voice</p>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-[#94A3B8] block mb-1.5">Agent name</label>
                  <input value={form.agentName} onChange={e => set("agentName", e.target.value)} placeholder="e.g. Priya, Aria, Deepa" className="w-full bg-[#080C14] border border-[#1E2A3E] focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-[#475569] outline-none transition-colors" />
                </div>
                <div>
                  <label className="text-xs font-medium text-[#94A3B8] block mb-1.5">Language</label>
                  <select value={form.agentLanguage} onChange={e => set("agentLanguage", e.target.value)} className="w-full bg-[#080C14] border border-[#1E2A3E] focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-sm text-white outline-none">
                    <option value="hi">Hindi (हिन्दी)</option>
                    <option value="en">English</option>
                    <option value="hi-en">Hindi + English (bilingual)</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-[#94A3B8] block mb-1.5">Voice</label>
                  <div className="space-y-2">
                    {VOICES.map(v => (
                      <button key={v.id} onClick={() => { set("agentVoiceId", v.id); set("agentLanguage", v.lang); }}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-all text-left ${form.agentVoiceId === v.id ? "border-blue-500 bg-blue-500/10" : "border-[#1E2A3E] hover:border-[#2A3A54]"}`}>
                        <div className="w-8 h-8 rounded-full bg-[#1E2A3E] flex items-center justify-center text-sm">🎙</div>
                        <div className="text-sm font-medium">{v.name}</div>
                        {form.agentVoiceId === v.id && <div className="ml-auto text-blue-400 text-xs">Selected</div>}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setStep(1)} className="px-4 py-2.5 text-sm text-[#94A3B8] border border-[#1E2A3E] rounded-xl hover:border-[#2A3A54] transition-colors">Back</button>
                <button onClick={createTenant} disabled={loading} className="flex-1 bg-blue-600 hover:bg-blue-500 transition-colors text-white font-medium py-2.5 rounded-xl text-sm disabled:opacity-50">
                  {loading ? "Setting up..." : "Create agent →"}
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Connect calendar */}
          {step === 3 && (
            <div>
              <h2 className="text-2xl font-normal mb-1" style={{ fontFamily: "'Instrument Serif', serif" }}>Connect Google Calendar</h2>
              <p className="text-sm text-[#94A3B8] mb-6">Your agent will check real availability and book directly to your calendar</p>
              <div className="bg-[#080C14] border border-[#1E2A3E] rounded-xl p-4 mb-6 flex items-start gap-3">
                <span className="text-2xl">📅</span>
                <div>
                  <div className="text-sm font-medium mb-1">Google Calendar</div>
                  <div className="text-xs text-[#94A3B8]">When a caller asks for an appointment, your agent will check your calendar for free slots and book directly — no double bookings.</div>
                </div>
              </div>
              <div className="space-y-3">
                <button
                  onClick={async () => {
                    try {
                      const res = await api.get(`/tenants/${tenantId}/calendar/auth-url`);
                      window.open(res.url, "_blank", "width=500,height=600");
                      window.addEventListener("message", (e) => {
                        if (e.data?.type === "calendar_connected") setStep(4);
                      }, { once: true });
                    } catch { alert("Google OAuth not configured — skipping"); setStep(4); }
                  }}
                  className="w-full flex items-center justify-center gap-2 bg-white hover:bg-gray-100 transition-colors text-gray-900 font-medium py-3 rounded-xl text-sm"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                  Connect Google Calendar
                </button>
                <button onClick={() => setStep(4)} className="w-full text-center text-sm text-[#475569] hover:text-[#94A3B8] transition-colors py-2">
                  Skip for now (use mock availability)
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Done */}
          {step === 4 && (
            <div className="text-center py-4">
              <div className="text-5xl mb-4">🎉</div>
              <h2 className="text-2xl font-normal mb-2" style={{ fontFamily: "'Instrument Serif', serif" }}>Your agent is ready!</h2>
              <p className="text-sm text-[#94A3B8] mb-8">Your AI receptionist is live and ready to take calls.</p>
              <button
                onClick={async () => {
                  setLoading(true);
                  try {
                    await api.post(`/tenants/${tenantId}/setup-agent`, { webhook_base_url: window.location.origin });
                  } catch { /* ignore */ }
                  // Hard reload so Better Auth re-reads the updated session with new tenantId
                  window.location.href = "/dashboard";
                }}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-500 text-white font-medium px-8 py-3 rounded-xl text-sm transition-colors disabled:opacity-50"
              >
                {loading ? "Launching..." : "Go to dashboard →"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
