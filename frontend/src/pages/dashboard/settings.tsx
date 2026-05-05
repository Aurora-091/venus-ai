import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { authClient } from '../../lib/auth';

interface Props {
  tenant?: any;
  onTenantUpdate?: (t: any) => void;
}

const TIMEZONES = [
  'Asia/Kolkata',
  'Asia/Dhaka',
  'Asia/Karachi',
  'Asia/Dubai',
  'Asia/Singapore',
  'Asia/Tokyo',
  'Europe/London',
  'Europe/Berlin',
  'America/New_York',
  'America/Los_Angeles',
  'America/Chicago',
];

const PLANS = [
  {
    id: 'starter',
    name: 'Starter',
    price: '₹4,999/mo',
    calls: '500 calls',
    features: ['1 agent', 'Basic analytics', 'Email support'],
  },
  {
    id: 'growth',
    name: 'Growth',
    price: '₹14,999/mo',
    calls: '2,000 calls',
    features: [
      '3 agents',
      'Advanced analytics',
      'Google Calendar',
      'Priority support',
    ],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 'Custom',
    calls: 'Unlimited',
    features: [
      'Unlimited agents',
      'Custom integrations',
      'Dedicated support',
      'SLA',
    ],
  },
];

export default function Settings({ tenant, onTenantUpdate }: Props) {
  const [form, setForm] = useState({ name: '', timezone: 'Asia/Kolkata' });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [msgType, setMsgType] = useState<'ok' | 'err'>('ok');
  const [tab, setTab] = useState<'general' | 'plan' | 'danger'>('general');

  useEffect(() => {
    if (!tenant) return;
    setForm({
      name: tenant.name || '',
      timezone: tenant.timezone || 'Asia/Kolkata',
    });
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
      await api.patch(`/tenants/${tenant.id}`, form);
      showMsg('Settings saved.');
      onTenantUpdate?.({ ...tenant, ...form });
    } catch (e: any) {
      showMsg('Save failed: ' + e.message, 'err');
    }
    setSaving(false);
  };

  const handleDeleteWorkspace = async () => {
    if (!tenant?.id) return;
    const confirmed = window.confirm(
      `Delete workspace "${tenant.name}"? This cannot be undone.`
    );
    if (!confirmed) return;
    try {
      await api.delete(`/tenants/${tenant.id}`);
      window.location.href = '/dashboard';
    } catch (e: any) {
      showMsg('Delete failed: ' + e.message, 'err');
    }
  };

  const handleSignOut = async () => {
    await authClient.signOut();
    window.location.href = '/';
  };

  if (!tenant) {
    return (
      <div className="p-8 text-sm text-[#475569]">Select a workspace.</div>
    );
  }

  return (
    <div className="p-6 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-xl font-semibold">Settings</h1>
        <p className="text-sm text-[#475569] mt-0.5">{tenant.name}</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-[#0F1623] border border-[#1E2A3E] rounded-xl p-1 mb-6 w-fit">
        {(['general', 'plan', 'danger'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`text-xs px-4 py-2 rounded-lg capitalize transition-colors ${
              tab === t
                ? 'bg-[#1E2A3E] text-white'
                : 'text-[#475569] hover:text-[#94A3B8]'
            }`}
          >
            {t}
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

      {tab === 'general' && (
        <div className="bg-[#0F1623] border border-[#1E2A3E] rounded-2xl p-6 space-y-5">
          <div>
            <label className="block text-xs font-medium text-[#94A3B8] mb-1.5">
              Workspace name
            </label>
            <input
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
              className="w-full bg-[#080C14] border border-[#1E2A3E] focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-sm text-white outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#94A3B8] mb-1.5">
              Timezone
            </label>
            <select
              value={form.timezone}
              onChange={(e) => set('timezone', e.target.value)}
              className="w-full bg-[#080C14] border border-[#1E2A3E] focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-sm text-white outline-none transition-colors"
            >
              {TIMEZONES.map((tz) => (
                <option key={tz} value={tz}>
                  {tz.replace('_', ' ')}
                </option>
              ))}
            </select>
          </div>

          <div className="pt-1">
            <div className="text-xs text-[#475569] mb-1">Workspace ID</div>
            <div className="font-mono text-xs text-[#475569] bg-[#080C14] px-3 py-2 rounded-lg">
              {tenant.id}
            </div>
          </div>

          <div className="pt-1">
            <div className="text-xs text-[#475569] mb-1">Vertical</div>
            <div className="text-sm capitalize">{tenant.vertical || '—'}</div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm px-5 py-2.5 rounded-xl transition-colors font-medium"
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      )}

      {tab === 'plan' && (
        <div className="space-y-4">
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              className={`bg-[#0F1623] border rounded-2xl p-5 transition-colors ${
                plan.id === tenant.plan
                  ? 'border-blue-500/40'
                  : 'border-[#1E2A3E]'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{plan.name}</span>
                    {plan.id === tenant.plan && (
                      <span className="text-[10px] bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded-full">
                        Current
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-[#475569] mt-0.5">
                    {plan.calls}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-mono text-sm">{plan.price}</div>
                  {plan.id !== tenant.plan && plan.id !== 'enterprise' && (
                    <button className="text-xs text-blue-400 hover:text-blue-300 mt-1 transition-colors">
                      Upgrade →
                    </button>
                  )}
                  {plan.id === 'enterprise' && (
                    <button className="text-xs text-blue-400 hover:text-blue-300 mt-1 transition-colors">
                      Contact us →
                    </button>
                  )}
                </div>
              </div>
              <ul className="space-y-1">
                {plan.features.map((f) => (
                  <li
                    key={f}
                    className="flex items-center gap-2 text-xs text-[#94A3B8]"
                  >
                    <span className="text-emerald-400">✓</span> {f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      {tab === 'danger' && (
        <div className="space-y-4">
          <div className="bg-[#0F1623] border border-[#1E2A3E] rounded-2xl p-5">
            <div className="text-sm font-medium mb-1">Sign out</div>
            <div className="text-xs text-[#475569] mb-4">
              Sign out of your VoiceOS account on this device.
            </div>
            <button
              onClick={handleSignOut}
              className="text-sm bg-[#1E2A3E] hover:bg-[#2A3A54] text-[#94A3B8] px-4 py-2 rounded-xl transition-colors"
            >
              Sign out
            </button>
          </div>

          <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-5">
            <div className="text-sm font-medium text-red-400 mb-1">
              Delete workspace
            </div>
            <div className="text-xs text-[#475569] mb-4">
              Permanently delete{' '}
              <strong className="text-white">{tenant.name}</strong> and all
              associated call logs, bookings, and agent configuration. This
              cannot be undone.
            </div>
            <button
              onClick={handleDeleteWorkspace}
              className="text-sm bg-red-600/20 hover:bg-red-600/40 text-red-400 px-4 py-2 rounded-xl transition-colors border border-red-500/20"
            >
              Delete workspace
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
