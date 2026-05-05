import { useState } from 'react';
import { api } from '../lib/api';

const STEPS = ['Vertical', 'Details', 'Agent', 'Connect', 'Done'];

const VERTICALS = [
  {
    id: 'clinic',
    icon: '🏥',
    title: 'Clinic / Hospital',
    desc: 'Appointment booking, doctor availability, patient queries',
  },
  {
    id: 'hotel',
    icon: '🏨',
    title: 'Hotel / Hospitality',
    desc: 'Room reservations, concierge, housekeeping requests',
  },
  {
    id: 'ecommerce',
    icon: '🛍️',
    title: 'E-commerce / D2C',
    desc: 'Order status, returns, delivery queries via Shopify',
  },
];

const VOICES = [
  { id: '1Z7Y8o9cvUeWq8oLKgMY', name: 'Priya (Hindi Female)', lang: 'hi' },
  { id: '21m00Tcm4TlvDq8ikWAM', name: 'Rachel (English Female)', lang: 'en' },
  { id: 'TxGEqnHWrfWFTfGW9XjX', name: 'Josh (English Male)', lang: 'en' },
];

export default function Onboarding() {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [tenantId, setTenantId] = useState('');
  const [form, setForm] = useState({
    vertical: '',
    name: '',
    agentName: '',
    agentLanguage: 'en',
    agentVoiceId: '21m00Tcm4TlvDq8ikWAM',
    businessHoursStart: '09:00',
    businessHoursEnd: '20:00',
    shopifyUrl: '',
    shopifyToken: '',
  });

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const createTenant = async () => {
    setLoading(true);
    try {
      const payload: any = { ...form };
      if (form.vertical === 'ecommerce') {
        payload.external_integrations = {
          shopifyUrl: form.shopifyUrl,
          shopifyToken: form.shopifyToken,
        };
      }
      const res = await api.post('/tenants', payload);
      setTenantId(res.tenantId);
      setStep(3);
    } catch (e: any) {
      alert('Failed: ' + e.message);
    }
    setLoading(false);
  };

  const isEcommerce = form.vertical === 'ecommerce';

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4 font-sans text-[#EDEDED] selection:bg-[#333] selection:text-white pb-20 pt-10">
      <div className="w-full max-w-2xl">
        {/* Header Logo */}
        <div className="flex items-center gap-2 mb-10 justify-center animate-fade-up">
          <div className="w-8 h-8 rounded-md bg-white flex items-center justify-center text-sm font-bold text-black">
            V
          </div>
          <span className="font-semibold text-[15px] tracking-tight">
            VoiceOS Setup
          </span>
        </div>

        {/* Steps Tracker */}
        <div className="flex items-center gap-2 mb-10 justify-center animate-fade-up">
          {STEPS.map((s, i) => {
            let stateClass = 'bg-[#111] text-[#666] border border-[#333]';
            if (i < step)
              stateClass = 'bg-white text-black border border-white';
            else if (i === step)
              stateClass = 'bg-[#222] text-white border border-[#444]';

            return (
              <div key={s} className="flex items-center gap-2">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-all ${stateClass}`}
                >
                  {i < step ? '✓' : i + 1}
                </div>
                {i < STEPS.length - 1 && (
                  <div
                    className={`w-8 h-px ${i < step ? 'bg-white/50' : 'bg-[#333]'}`}
                  />
                )}
              </div>
            );
          })}
        </div>

        <div className="bg-[#0A0A0A] border border-[#222] rounded-xl p-8 relative overflow-hidden animate-fade-in shadow-2xl">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#666] to-transparent opacity-50"></div>

          {/* Step 0: Pick vertical */}
          {step === 0 && (
            <div className="animate-fade-up">
              <h2 className="text-2xl font-semibold mb-2 tracking-tight text-white">
                What kind of business is this for?
              </h2>
              <p className="text-sm text-[#A1A1A1] mb-8">
                Choose your industry — each comes with a pre-built agent
                template tailored for your use-case.
              </p>
              <div className="space-y-3">
                {VERTICALS.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => {
                      set('vertical', v.id);
                      setStep(1);
                    }}
                    className="w-full flex items-start gap-4 p-5 rounded-md border border-[#222] bg-[#111] hover:bg-[#1a1a1a] hover:border-[#444] transition-all text-left"
                  >
                    <span className="text-2xl">{v.icon}</span>
                    <div className="flex-1">
                      <div className="font-medium text-sm text-white">
                        {v.title}
                      </div>
                      <div className="text-xs text-[#A1A1A1] mt-1">
                        {v.desc}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 1: Business details */}
          {step === 1 && (
            <div className="animate-fade-up">
              <h2 className="text-2xl font-semibold mb-2 tracking-tight text-white">
                Tell us about your business
              </h2>
              <p className="text-sm text-[#A1A1A1] mb-8">
                This personalises your agent's responses and capabilities.
              </p>

              <div className="space-y-5">
                <div>
                  <label className="text-xs font-medium text-[#A1A1A1] block mb-1.5">
                    {isEcommerce ? 'Store name' : 'Business name'} *
                  </label>
                  <input
                    value={form.name}
                    onChange={(e) => set('name', e.target.value)}
                    placeholder={
                      isEcommerce
                        ? 'e.g. Acme Tech Store'
                        : 'e.g. City Clinic Delhi'
                    }
                    className="w-full bg-[#111] border border-[#333] focus:border-white rounded-md px-3.5 py-2.5 text-sm text-white placeholder-[#666] outline-none transition-colors"
                  />
                </div>

                {!isEcommerce && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-medium text-[#A1A1A1] block mb-1.5">
                        Opening time
                      </label>
                      <input
                        type="time"
                        value={form.businessHoursStart}
                        onChange={(e) =>
                          set('businessHoursStart', e.target.value)
                        }
                        className="w-full bg-[#111] border border-[#333] focus:border-white rounded-md px-3.5 py-2.5 text-sm text-white outline-none transition-colors"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-[#A1A1A1] block mb-1.5">
                        Closing time
                      </label>
                      <input
                        type="time"
                        value={form.businessHoursEnd}
                        onChange={(e) =>
                          set('businessHoursEnd', e.target.value)
                        }
                        className="w-full bg-[#111] border border-[#333] focus:border-white rounded-md px-3.5 py-2.5 text-sm text-white outline-none transition-colors"
                      />
                    </div>
                  </div>
                )}

                {isEcommerce && (
                  <>
                    <div>
                      <label className="text-xs font-medium text-[#A1A1A1] block mb-1.5">
                        Shopify Store URL
                      </label>
                      <input
                        value={form.shopifyUrl}
                        onChange={(e) => set('shopifyUrl', e.target.value)}
                        placeholder="e.g. my-store.myshopify.com"
                        className="w-full bg-[#111] border border-[#333] focus:border-white rounded-md px-3.5 py-2.5 text-sm text-white placeholder-[#666] outline-none transition-colors"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-[#A1A1A1] block mb-1.5">
                        Admin API Access Token{' '}
                        <span className="text-[#666]">(Optional for now)</span>
                      </label>
                      <input
                        type="password"
                        value={form.shopifyToken}
                        onChange={(e) => set('shopifyToken', e.target.value)}
                        placeholder="shpat_..."
                        className="w-full bg-[#111] border border-[#333] focus:border-white rounded-md px-3.5 py-2.5 text-sm text-white placeholder-[#666] outline-none transition-colors"
                      />
                    </div>
                  </>
                )}
              </div>

              <div className="flex gap-3 mt-8">
                <button
                  onClick={() => setStep(0)}
                  className="px-5 py-2.5 text-sm text-[#A1A1A1] bg-[#111] hover:bg-[#222] border border-[#333] rounded-md transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={() => form.name && setStep(2)}
                  className="flex-1 bg-white hover:bg-gray-200 transition-colors text-black font-semibold py-2.5 rounded-md text-sm disabled:opacity-50"
                  disabled={!form.name}
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Agent config */}
          {step === 2 && (
            <div className="animate-fade-up">
              <h2 className="text-2xl font-semibold mb-2 tracking-tight text-white">
                Customise your AI agent
              </h2>
              <p className="text-sm text-[#A1A1A1] mb-8">
                Give your agent a name and voice to represent your brand.
              </p>

              <div className="space-y-5">
                <div>
                  <label className="text-xs font-medium text-[#A1A1A1] block mb-1.5">
                    Agent name
                  </label>
                  <input
                    value={form.agentName}
                    onChange={(e) => set('agentName', e.target.value)}
                    placeholder="e.g. Priya, Aria, Deepa"
                    className="w-full bg-[#111] border border-[#333] focus:border-white rounded-md px-3.5 py-2.5 text-sm text-white placeholder-[#666] outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-[#A1A1A1] block mb-1.5">
                    Primary Language
                  </label>
                  <select
                    value={form.agentLanguage}
                    onChange={(e) => set('agentLanguage', e.target.value)}
                    className="w-full bg-[#111] border border-[#333] focus:border-white rounded-md px-3.5 py-2.5 text-sm text-white outline-none transition-colors"
                  >
                    <option value="en">English</option>
                    <option value="hi">Hindi (हिन्दी)</option>
                    <option value="hi-en">Hindi + English (bilingual)</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-[#A1A1A1] block mb-1.5">
                    Agent Voice
                  </label>
                  <div className="space-y-2">
                    {VOICES.map((v) => (
                      <button
                        key={v.id}
                        onClick={() => {
                          set('agentVoiceId', v.id);
                          set('agentLanguage', v.lang);
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-md border transition-all text-left ${form.agentVoiceId === v.id ? 'border-white bg-[#111]' : 'border-[#222] bg-transparent hover:bg-[#111]'}`}
                      >
                        <div className="w-8 h-8 rounded-full bg-[#222] flex items-center justify-center text-sm border border-[#333]">
                          🎙
                        </div>
                        <div className="text-sm font-medium text-white">
                          {v.name}
                        </div>
                        {form.agentVoiceId === v.id && (
                          <div className="ml-auto text-white text-xs font-medium px-2 py-0.5 bg-[#333] rounded-sm">
                            Selected
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-8">
                <button
                  onClick={() => setStep(1)}
                  className="px-5 py-2.5 text-sm text-[#A1A1A1] bg-[#111] hover:bg-[#222] border border-[#333] rounded-md transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={createTenant}
                  disabled={loading}
                  className="flex-1 bg-white hover:bg-gray-200 transition-colors text-black font-semibold py-2.5 rounded-md text-sm disabled:opacity-50"
                >
                  {loading ? 'Deploying...' : 'Create Workspace →'}
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Connect Integrations */}
          {step === 3 && (
            <div className="animate-fade-up">
              <h2 className="text-2xl font-semibold mb-2 tracking-tight text-white">
                {isEcommerce ? 'Connect Shopify Data' : 'Connect your Calendar'}
              </h2>
              <p className="text-sm text-[#A1A1A1] mb-8">
                {isEcommerce
                  ? 'Your agent needs access to order history and tracking statuses to resolve customer queries.'
                  : 'Your agent will check real availability and book directly to your calendar to avoid double bookings.'}
              </p>

              <div className="bg-[#111] border border-[#333] rounded-xl p-5 mb-8 flex items-start gap-4">
                <div className="text-2xl">{isEcommerce ? '🛍️' : '📅'}</div>
                <div>
                  <div className="text-sm font-semibold mb-1 text-white">
                    {isEcommerce
                      ? 'Shopify API Integration'
                      : 'Google Calendar Integration'}
                  </div>
                  <div className="text-xs text-[#A1A1A1] leading-relaxed">
                    {isEcommerce
                      ? 'When a customer calls and provides their phone number, the agent will instantly lookup their active orders and can provide fulfillment statuses.'
                      : 'When a caller asks for an appointment, your agent will check your calendar for free slots and book directly — seamlessly synchronising with your schedule.'}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {isEcommerce ? (
                  <button
                    onClick={() => setStep(4)}
                    className="w-full flex items-center justify-center gap-2 bg-white hover:bg-gray-200 transition-colors text-black font-semibold py-3 rounded-md text-sm"
                  >
                    Test Connection
                  </button>
                ) : (
                  <button
                    onClick={async () => {
                      try {
                        const res = (await api.get(
                          `/tenants/${tenantId}/calendar/auth-url`
                        )) as { url?: string | null; error?: string };
                        if (!res.url) {
                          alert(
                            res.error ||
                              'Google OAuth is not configured on the server. Add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to backend/.env, or skip for now.'
                          );
                          return;
                        }
                        window.open(res.url, '_blank', 'width=500,height=600');
                        window.addEventListener(
                          'message',
                          (e) => {
                            if (e.data?.type === 'calendar_connected')
                              setStep(4);
                          },
                          { once: true }
                        );
                      } catch (e: unknown) {
                        const err = e as Error & { status?: number };
                        const msg =
                          err instanceof Error ? err.message : 'Request failed';
                        alert(
                          err.status === 503
                            ? 'Google OAuth is not configured. Add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to backend/.env, or use Skip below.'
                            : msg
                        );
                      }
                    }}
                    className="w-full flex items-center justify-center gap-2 bg-white hover:bg-gray-200 transition-colors text-black font-semibold py-3 rounded-md text-sm"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    Connect Google Calendar
                  </button>
                )}

                <button
                  onClick={() => setStep(4)}
                  className="w-full text-center text-sm text-[#A1A1A1] hover:text-white transition-colors py-2 font-medium"
                >
                  Skip for now (use mock data)
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Done & Live Call Test */}
          {step === 4 && (
            <div className="text-center py-6 animate-fade-up">
              <div className="w-16 h-16 bg-[#111] border border-[#333] rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl">🎉</span>
              </div>
              <h2 className="text-2xl font-semibold mb-2 tracking-tight text-white">
                Your agent is live.
              </h2>
              <p className="text-sm text-[#A1A1A1] mb-8 max-w-sm mx-auto">
                We've generated your custom prompt and hooked up the knowledge
                base. You can test call it right now.
              </p>

              <div className="bg-[#111] border border-[#333] rounded-xl p-6 mb-8 text-left">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex-1">
                    <p className="text-xs text-[#A1A1A1] font-medium uppercase tracking-wider mb-1">
                      Assigned Phone Number
                    </p>
                    <p className="text-xl font-mono text-white">
                      +1 (415) 555-0198
                    </p>
                  </div>
                  <div
                    className="w-10 h-10 bg-[#0A0A0A] border border-[#222] rounded-full flex items-center justify-center text-white cursor-help"
                    title="To place a web call, click the button below. Calling directly is restricted in demo mode."
                  >
                    ?
                  </div>
                </div>
                <div className="border-t border-[#333] pt-4 mt-2">
                  <button className="w-full flex items-center justify-center gap-2 bg-[#10B981] hover:bg-[#059669] text-white font-semibold py-3 rounded-md text-sm transition-colors shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                    <span>📞</span> Call Agent via Web
                  </button>
                </div>
              </div>

              <button
                onClick={async () => {
                  setLoading(true);
                  try {
                    await api.post(`/tenants/${tenantId}/setup-agent`, {
                      webhook_base_url: window.location.origin,
                    });
                  } catch {
                    /* ignore */
                  }
                  window.location.href = '/dashboard';
                }}
                disabled={loading}
                className="w-full bg-white hover:bg-gray-200 text-black font-semibold px-8 py-3 rounded-md text-sm transition-colors disabled:opacity-50"
              >
                {loading ? 'Generating agent...' : 'Go to your Dashboard →'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
