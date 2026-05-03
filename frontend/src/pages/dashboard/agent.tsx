import { useEffect, useState } from 'react';
import { Link } from 'wouter';
import { api } from '../../lib/api';

interface Props {
  tenant?: any;
  onTenantUpdate?: (t: any) => void;
}

const VOICES = [
  { id: '1Z7Y8o9cvUeWq8oLKgMY', name: 'Priya (Hindi Female)' },
  { id: '21m00Tcm4TlvDq8ikWAM', name: 'Rachel (English Female)' },
  { id: 'TxGEqnHWrfWFTfGW9XjX', name: 'Josh (English Male)' },
  { id: 'VR6AewLTigWG4xSOukaG', name: 'Arnold (English Male)' },
  { id: 'pNInz6obpgDQGcFmaJgB', name: 'Adam (English Male)' },
];

const TABS = [
  { id: 'personality', label: 'Personality' },
  { id: 'knowledge', label: 'Knowledge Base' },
  { id: 'tools', label: 'Tools & Integrations' },
  { id: 'settings', label: 'Business Hours' },
  { id: 'channels', label: 'Channels' },
  { id: 'advanced', label: 'Advanced' },
];

export default function AgentStudio({ tenant, onTenantUpdate }: Props) {
  const [activeTab, setActiveTab] = useState('personality');
  const [form, setForm] = useState({
    agentName: '',
    agentLanguage: 'hi',
    agentVoiceId: '',
    agentGreeting: '',
    businessHoursStart: '09:00',
    businessHoursEnd: '20:00',
    shopifyUrl: '',
    shopifyToken: '',
  });
  const [saving, setSaving] = useState(false);
  const [setting, setSetting] = useState(false);
  const [msg, setMsg] = useState('');
  const [msgType, setMsgType] = useState<'ok' | 'err'>('ok');
  const [widgetReady, setWidgetReady] = useState(false);

  useEffect(() => {
    if (!tenant) return;
    setForm({
      agentName: tenant.agentName || '',
      agentLanguage: tenant.agentLanguage || 'hi',
      agentVoiceId: tenant.agentVoiceId || '',
      agentGreeting: tenant.agentGreeting || '',
      businessHoursStart: tenant.businessHoursStart || '09:00',
      businessHoursEnd: tenant.businessHoursEnd || '20:00',
      shopifyUrl: tenant.metadata?.shopify?.storeUrl || '',
      shopifyToken: tenant.metadata?.shopify?.adminToken || '',
    });
    setWidgetReady(false);
  }, [tenant?.id]);

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const showMsg = (m: string, t: 'ok' | 'err' = 'ok') => {
    setMsg(m);
    setMsgType(t);
    setTimeout(() => setMsg(''), 4000);
  };

  const handleSave = async () => {
    if (!tenant?.id) return;
    setSaving(true);
    try {
      const payload = {
        ...form,
        metadata: {
          ...tenant.metadata,
          shopify: {
            storeUrl: form.shopifyUrl,
            adminToken: form.shopifyToken,
          },
        },
      };
      await api.patch(`/tenants/${tenant.id}`, payload);
      showMsg('Agent settings saved.');
      onTenantUpdate?.({ ...tenant, ...payload });
    } catch (e: any) {
      showMsg('Save failed: ' + e.message, 'err');
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
      showMsg(
        res.needsPhoneNumber
          ? `Agent created: ${res.agentId}. Add a real Twilio phone number to enable calls.`
          : `Agent created! ID: ${res.agentId}`
      );
      onTenantUpdate?.({
        ...tenant,
        agentId: res.agentId,
        phoneNumberId: res.phoneNumberId || tenant.phoneNumberId,
        phoneNumber: res.phoneNumber || tenant.phoneNumber,
        agentStatus: res.needsPhoneNumber ? 'agent_created' : 'active',
      });
    } catch (e: any) {
      showMsg('Setup failed: ' + cleanError(e.message), 'err');
    }
    setSetting(false);
  };

  if (!tenant) {
    return (
      <div className="p-8 text-sm text-[#475569]">
        Select a workspace first.
      </div>
    );
  }

  const hasRealAgent = !!tenant.agentId && !tenant.agentId.startsWith('local-');
  const hasRealPhoneNumber =
    !!tenant.phoneNumberId && !tenant.phoneNumberId.startsWith('local-');
  const isConfigured = hasRealAgent;

  return (
    <div className="p-6 max-w-5xl flex gap-6 relative min-h-[calc(100vh-80px)]">
      {/* Main Content Area */}
      <div className="flex-1 max-w-3xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold">Agent Studio</h1>
            <p className="text-sm text-[#475569] mt-0.5">
              Configure your AI voice agent's personality and tools
            </p>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm px-5 py-2.5 rounded-xl transition-colors font-medium"
          >
            {saving ? 'Saving...' : 'Save Config'}
          </button>
        </div>

        {/* 6-Tab Navigation */}
        <div className="flex border-b border-[#1E2A3E] mb-6 overflow-x-auto no-scrollbar">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-[#94A3B8] hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {msg && (
          <div
            className={`mb-5 text-xs px-4 py-2.5 rounded-xl ${msgType === 'ok' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}
          >
            {msg}
          </div>
        )}

        {/* Status Banner */}
        <div
          className={`flex items-center justify-between rounded-2xl px-5 py-4 mb-6 border ${
            isConfigured
              ? 'bg-emerald-500/5 border-emerald-500/20'
              : 'bg-amber-500/5 border-amber-500/20'
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-2 h-2 rounded-full ${isConfigured ? 'bg-emerald-400 pulse-live' : 'bg-amber-400'}`}
            />
            <div>
              <div
                className={`text-sm font-medium ${isConfigured ? 'text-emerald-300' : 'text-amber-300'}`}
              >
                {isConfigured ? 'Agent live' : 'Agent not set up'}
              </div>
              <div className="text-xs text-[#94A3B8] mt-0.5">
                {isConfigured
                  ? `ElevenLabs ID: ${tenant.agentId}`
                  : 'Connect ElevenLabs to activate voice calls'}
              </div>
            </div>
          </div>
          {!isConfigured ? (
            <button
              onClick={handleSetupAgent}
              disabled={setting}
              className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs px-4 py-2 rounded-xl transition-colors"
            >
              {setting ? 'Creating...' : 'Create Agent'}
            </button>
          ) : (
            <button
              onClick={handleSetupAgent}
              disabled={setting}
              className="bg-[#1E2A3E] hover:bg-[#2A3A54] text-[#94A3B8] text-xs px-4 py-2 rounded-xl transition-colors"
            >
              {setting ? 'Rebuilding...' : 'Rebuild Agent'}
            </button>
          )}
        </div>

        {/* Tab Content */}
        <div className="bg-[#0F1623] border border-[#1E2A3E] rounded-2xl p-6 mb-20 md:mb-0">
          {activeTab === 'personality' && (
            <div className="space-y-5">
              <h2 className="text-sm font-semibold text-[#94A3B8] uppercase tracking-wide">
                Core Personality
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#94A3B8] mb-1.5">
                    Agent Name
                  </label>
                  <input
                    value={form.agentName}
                    onChange={(e) => set('agentName', e.target.value)}
                    placeholder="Priya"
                    className="w-full bg-[#080C14] border border-[#1E2A3E] hover:border-[#2A3A54] focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-[#475569] outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#94A3B8] mb-1.5">
                    Language
                  </label>
                  <select
                    value={form.agentLanguage}
                    onChange={(e) => set('agentLanguage', e.target.value)}
                    className="w-full bg-[#080C14] border border-[#1E2A3E] focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-sm text-white outline-none transition-colors"
                  >
                    <option value="hi">Hindi</option>
                    <option value="en">English</option>
                    <option value="hi-en">Hinglish</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-[#94A3B8] mb-1.5">
                  Voice Engine
                </label>
                <select
                  value={form.agentVoiceId}
                  onChange={(e) => set('agentVoiceId', e.target.value)}
                  className="w-full bg-[#080C14] border border-[#1E2A3E] focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-sm text-white outline-none transition-colors"
                >
                  {VOICES.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-[#94A3B8] mb-1.5">
                  Greeting Message
                </label>
                <textarea
                  value={form.agentGreeting}
                  onChange={(e) => set('agentGreeting', e.target.value)}
                  rows={3}
                  placeholder="Namaste! City Clinic Delhi mein aapka swagat hai..."
                  className="w-full bg-[#080C14] border border-[#1E2A3E] focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-[#475569] outline-none transition-colors resize-none"
                />
                <div className="text-xs text-[#475569] mt-1">
                  This is the first phrase spoken when the call connects. Keep
                  it brief.
                </div>
              </div>
            </div>
          )}

          {activeTab === 'knowledge' && (
            <div className="space-y-5">
              <h2 className="text-sm font-semibold text-[#94A3B8] uppercase tracking-wide">
                Knowledge Base
              </h2>
              <div className="bg-[#080C14] border border-[#1E2A3E] border-dashed rounded-xl p-8 text-center">
                <div className="w-12 h-12 rounded-full bg-[#1E2A3E] flex items-center justify-center mx-auto mb-3">
                  <svg
                    className="w-5 h-5 text-[#94A3B8]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                    />
                  </svg>
                </div>
                <h3 className="text-sm font-medium mb-1">Upload Documents</h3>
                <p className="text-xs text-[#475569] mb-4">
                  Upload PDFs, menus, or FAQs to train your agent.
                </p>
                <button className="bg-[#1E2A3E] hover:bg-[#2A3A54] text-white text-xs px-4 py-2 rounded-lg transition-colors">
                  Select Files
                </button>
              </div>
              <div className="space-y-2">
                <div className="text-xs font-medium text-[#94A3B8]">
                  Active Documents
                </div>
                <div className="text-xs text-[#475569] p-4 border border-[#1E2A3E] rounded-xl bg-[#080C14]">
                  No documents uploaded yet. The agent currently relies on base
                  instructions.
                </div>
              </div>
            </div>
          )}

          {activeTab === 'tools' && (
            <div className="space-y-5">
              <h2 className="text-sm font-semibold text-[#94A3B8] uppercase tracking-wide">
                Tools & Integrations
              </h2>

              {tenant.vertical === 'ecommerce' && (
                <div className="border border-emerald-500/30 bg-emerald-500/5 rounded-xl p-5 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-3">
                    <span className="text-[10px] font-bold bg-emerald-500 text-white px-2 py-1 rounded">
                      ACTIVE
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-[#95BF47] flex items-center justify-center">
                      <svg
                        className="w-6 h-6 text-white"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          d="M19.78 6.55A7 7 0 0013.91 4h-3.82L9.4 6c-3 1.87-4.4 3.92-4.4 7a7 7 0 006.1 6.94A7 7 0 0020 13a6.83 6.83 0 00-.22-6.45z"
                          opacity=".2"
                        />
                        <path d="M14.65 3A5.4 5.4 0 0010 5.45c-1.3 1.95-1.5 4.3-1.5 6.05A5.64 5.64 0 0014 17a5.55 5.55 0 005.65-5.5C19.65 6.86 17.5 3 14.65 3z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-emerald-500">
                        Shopify Connector
                      </h3>
                      <p className="text-xs text-[#94A3B8]">
                        Enable order tracking & returns via voice.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-[#94A3B8] mb-1">
                        Store URL
                      </label>
                      <input
                        value={form.shopifyUrl}
                        onChange={(e) => set('shopifyUrl', e.target.value)}
                        placeholder="mystore.myshopify.com"
                        className="w-full bg-[#080C14] border border-[#1E2A3E] focus:border-emerald-500 rounded-lg px-3 py-2 text-sm text-white placeholder-[#475569] outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[#94A3B8] mb-1">
                        Admin API Token
                      </label>
                      <input
                        type="password"
                        value={form.shopifyToken}
                        onChange={(e) => set('shopifyToken', e.target.value)}
                        placeholder="shpat_xxxxxxxxxxxxx"
                        className="w-full bg-[#080C14] border border-[#1E2A3E] focus:border-emerald-500 rounded-lg px-3 py-2 text-sm text-white placeholder-[#475569] outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {tenant.vertical !== 'ecommerce' && (
                <div className="border border-blue-500/30 bg-blue-500/5 rounded-xl p-5 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-3">
                    <span className="text-[10px] font-bold bg-blue-500 text-white px-2 py-1 rounded">
                      RECOMMENDED
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center">
                      <svg
                        className="w-6 h-6 text-blue-500"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-blue-400">
                        Google Calendar
                      </h3>
                      <p className="text-xs text-[#94A3B8]">
                        Allow AI to book appointments directly in your calendar.
                      </p>
                    </div>
                  </div>
                  <Link
                    href="/dashboard/integrations"
                    className="block w-full text-center bg-blue-600 hover:bg-blue-500 text-white text-xs px-4 py-2.5 rounded-lg transition-colors font-medium"
                  >
                    Open Integrations to connect
                  </Link>
                </div>
              )}

              <div className="border border-[#1E2A3E] bg-[#080C14] rounded-xl p-4 flex items-center justify-between opacity-60">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-[#1E2A3E] flex items-center justify-center text-[#94A3B8]">
                    📞
                  </div>
                  <div>
                    <h3 className="text-sm font-medium">Auto-Call Transfer</h3>
                    <p className="text-xs text-[#475569]">
                      Route complex calls to a human.
                    </p>
                  </div>
                </div>
                <button className="text-xs text-[#475569] font-medium px-3 py-1.5 border border-[#1E2A3E] rounded shadow-sm bg-[#0F1623]">
                  Configure
                </button>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-5">
              <h2 className="text-sm font-semibold text-[#94A3B8] uppercase tracking-wide">
                Business Hours
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#94A3B8] mb-1.5">
                    Opens at
                  </label>
                  <input
                    type="time"
                    value={form.businessHoursStart}
                    onChange={(e) => set('businessHoursStart', e.target.value)}
                    className="w-full bg-[#080C14] border border-[#1E2A3E] focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-sm text-white outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#94A3B8] mb-1.5">
                    Closes at
                  </label>
                  <input
                    type="time"
                    value={form.businessHoursEnd}
                    onChange={(e) => set('businessHoursEnd', e.target.value)}
                    className="w-full bg-[#080C14] border border-[#1E2A3E] focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-sm text-white outline-none transition-colors"
                  />
                </div>
              </div>
              <div className="text-xs text-[#475569] p-4 border border-[#1E2A3E] rounded-xl bg-[#080C14]">
                Outside of these hours, the AI will inform callers that the
                business is closed, but can still offer to take messages or
                schedule callbacks for the next day.
              </div>
            </div>
          )}

          {activeTab === 'channels' && (
            <div className="space-y-5">
              <h2 className="text-sm font-semibold text-[#94A3B8] uppercase tracking-wide">
                Connected Channels
              </h2>

              <div className="bg-[#080C14] border border-[#1E2A3E] rounded-2xl p-5 relative overflow-hidden">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                        />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-medium">Voice Calls (Twilio)</h3>
                      <p className="text-xs text-[#475569]">
                        {hasRealPhoneNumber
                          ? 'Successfully configured'
                          : 'Awaiting assignment'}
                      </p>
                    </div>
                  </div>
                  {hasRealPhoneNumber ? (
                    <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-1 rounded">
                      ACTIVE
                    </span>
                  ) : (
                    <span className="text-[10px] text-amber-400 font-bold bg-amber-500/10 px-2 py-1 rounded">
                      PENDING
                    </span>
                  )}
                </div>

                {hasRealPhoneNumber ? (
                  <div className="bg-[#0F1623] p-3 rounded-xl border border-[#1E2A3E] flex items-center justify-between">
                    <div>
                      <div className="text-[10px] text-[#475569] uppercase tracking-wide">
                        Phone Number
                      </div>
                      <div className="font-mono text-white text-sm">
                        {tenant.phoneNumber}
                      </div>
                    </div>
                    <button
                      className="text-[#94A3B8] hover:text-white transition-colors"
                      title="Copy"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                        />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <div className="text-xs text-[#94A3B8] text-center p-3">
                    Click "Create Agent" above to assign a phone number.
                  </div>
                )}
              </div>

              <div className="border border-[#1E2A3E] border-dashed rounded-xl p-4 flex items-center justify-center cursor-pointer hover:bg-[#1E2A3E]/30 transition-colors">
                <span className="text-sm font-medium text-blue-400">
                  + Add new channel (WhatsApp, Web)
                </span>
              </div>
            </div>
          )}

          {activeTab === 'advanced' && (
            <div className="space-y-5">
              <h2 className="text-sm font-semibold text-[#94A3B8] uppercase tracking-wide">
                Under The Hood
              </h2>

              <div className="bg-[#080C14] border border-[#1E2A3E] rounded-xl p-5">
                <div className="text-xs text-[#475569] mb-3 font-medium flex justify-between">
                  <span>GENERATED SYSTEM PROMPT</span>
                  <span className="text-xs text-blue-400">
                    Rebuilt on setup
                  </span>
                </div>
                <div className="font-mono text-[11px] text-[#94A3B8] leading-relaxed whitespace-pre-wrap">
                  {getSystemPromptPreview(
                    tenant.vertical,
                    form.agentName || tenant.agentName,
                    tenant.name
                  )}
                </div>
              </div>

              {hasRealAgent && (
                <div className="bg-[#080C14] border border-[#1E2A3E] rounded-xl p-5 flex items-center justify-between">
                  <div>
                    <div className="text-xs text-[#475569] mb-1 font-medium">
                      ElevenLabs Agent ID
                    </div>
                    <div className="font-mono text-sm text-white">
                      {tenant.agentId}
                    </div>
                  </div>
                  <a
                    href={`https://elevenlabs.io/app/conversational-ai/agents/${tenant.agentId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs bg-[#1E2A3E] hover:bg-[#2A3A54] text-white px-3 py-1.5 rounded-lg transition-colors"
                  >
                    Open Console ↗
                  </a>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Persistent Floating Widget Panel */}
      <div className="hidden md:block w-80 sticky top-6 self-start shrink-0">
        <div className="bg-[#080C14] border-2 border-[#1E2A3E] rounded-2xl overflow-hidden shadow-2xl flex flex-col h-[500px]">
          <div className="px-5 py-4 bg-[#0F1623] border-b border-[#1E2A3E] flex items-center justify-between shrink-0">
            <h3 className="font-semibold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 pulse-live"></span>
              Live Test
            </h3>
            <span className="text-[10px] bg-[#1E2A3E] text-[#94A3B8] px-2 py-0.5 rounded font-mono uppercase">
              Developer UI
            </span>
          </div>

          <div className="p-5 flex-1 flex flex-col justify-center items-center relative overflow-hidden bg-gradient-to-b from-[#080C14] to-[#0F1623]">
            {/* Background decorative blob */}
            <div className="absolute w-40 h-40 bg-blue-500/10 blur-3xl rounded-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none" />

            {hasRealAgent ? (
              <div className="w-full z-10 flex flex-col h-full">
                <div className="text-center mb-6 shrink-0">
                  <div className="w-16 h-16 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mx-auto mb-3">
                    <svg
                      className="w-8 h-8"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                      />
                    </svg>
                  </div>
                  <h4 className="text-sm font-medium">
                    Talk to {form.agentName || 'Agent'}
                  </h4>
                  <p className="text-xs text-[#475569] mt-1">
                    Interact using your microphone.
                  </p>
                </div>

                <div className="flex-1 flex flex-col justify-end">
                  {widgetReady ? (
                    <div className="bg-[#1E2A3E]/30 rounded-xl p-2 border border-[#1E2A3E]/50">
                      <elevenlabs-convai
                        key={tenant.agentId}
                        agent-id={tenant.agentId}
                      />
                    </div>
                  ) : (
                    <button
                      onClick={() => setWidgetReady(true)}
                      className="w-full bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium py-3 rounded-xl transition-all shadow-lg hover:shadow-blue-500/25 flex justify-center items-center gap-2"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      Initialize WebRTC
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center z-10 px-4">
                <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center mx-auto mb-3">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                </div>
                <h4 className="text-sm font-medium mb-1">
                  Testing Unavailable
                </h4>
                <p className="text-xs text-[#475569] leading-relaxed">
                  You must create your agent first using the blue button on the
                  left to test voice features.
                </p>
              </div>
            )}
          </div>
          <div className="bg-[#05080E] p-3 text-center border-t border-[#1E2A3E]">
            <p className="text-[10px] text-[#475569]">
              Calls placed here are logged to your dashboard.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function cleanError(raw: string): string {
  if (!raw) return 'Request failed';
  try {
    const parsed = JSON.parse(raw);
    if (
      typeof parsed.error === 'string' &&
      typeof parsed.details === 'string'
    ) {
      try {
        const details = JSON.parse(parsed.details);
        const messages = details.detail
          ?.map((item: any) => item.msg)
          .filter(Boolean);
        if (messages?.length)
          return `${parsed.error}: ${[...new Set(messages)].join('; ')}`;
      } catch {}
    }
    return parsed.error || raw;
  } catch {
    return raw;
  }
}

function getSystemPromptPreview(
  vertical: string,
  agentName: string,
  businessName: string
): string {
  if (vertical === 'clinic') {
    return `You are ${agentName}, a bilingual (Hindi/English) AI receptionist for ${businessName}.
Handle: appointment booking, appointment status, clinic hours, doctor availability.
Flow:
1. Greet warmly in Hindi
2. Ask how you can help
3. If appointment booking: ask name, preferred date/time → check_availability → confirm → book_appointment
4. For complex queries: arrange callback → end_call
Speak Hindi primarily, switch to English if needed.`;
  }
  if (vertical === 'hotel') {
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
