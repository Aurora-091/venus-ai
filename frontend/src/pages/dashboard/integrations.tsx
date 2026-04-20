import { useEffect, useState, useRef } from 'react';
import { api } from '../../lib/api';
import * as XLSX from 'xlsx';

interface Props {
  tenant?: any;
}

export default function Integrations({ tenant }: Props) {
  const [calStatus, setCalStatus] = useState<{
    connected: boolean;
    calendarId?: string;
  } | null>(null);
  const [sheetsStatus, setSheetsStatus] = useState<{
    connected: boolean;
    spreadsheetId?: string;
    spreadsheetUrl?: string;
    lastSync?: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const [sheetIdInput, setSheetIdInput] = useState('');
  const [showLinkInput, setShowLinkInput] = useState(false);
  const popupRef = useRef<Window | null>(null);

  const showMsg = (text: string, ok = true) => {
    setMsg({ text, ok });
    setTimeout(() => setMsg(null), 5000);
  };

  const loadStatus = async () => {
    if (!tenant?.id) return;
    setLoading(true);
    try {
      const [cal, sheets] = await Promise.all([
        api
          .get(`/tenants/${tenant.id}/calendar/status`)
          .catch(() => ({ connected: false })),
        api
          .get(`/tenants/${tenant.id}/sheets/status`)
          .catch(() => ({ connected: false })),
      ]);
      setCalStatus(cal);
      setSheetsStatus(sheets);
    } catch {}
    setLoading(false);
  };

  useEffect(() => {
    loadStatus();
  }, [tenant?.id]);

  // ── Google Calendar ──────────────────────────────────────────────────────
  const handleCalConnect = async () => {
    if (!tenant?.id) return;
    setConnecting('calendar');
    try {
      const r = await api.get(`/tenants/${tenant.id}/calendar/auth-url`);
      if (!r.url) {
        showMsg('Could not get auth URL', false);
        return;
      }
      const popup = window.open(
        r.url,
        'gcal_auth',
        'width=600,height=700,left=300,top=100'
      );
      popupRef.current = popup;
      const onMsg = async (e: MessageEvent) => {
        if (e.data?.type === 'calendar_connected') {
          window.removeEventListener('message', onMsg);
          await loadStatus();
          showMsg('Google Calendar connected!');
        }
      };
      window.addEventListener('message', onMsg);
    } catch (e: any) {
      showMsg('Failed: ' + e.message, false);
    }
    setConnecting(null);
  };

  const handleCalDisconnect = async () => {
    if (!tenant?.id || !confirm('Disconnect Google Calendar?')) return;
    await api.delete(`/tenants/${tenant.id}/calendar`).catch(() => {});
    setCalStatus({ connected: false });
    showMsg('Google Calendar disconnected.');
  };

  // ── Google Sheets ────────────────────────────────────────────────────────
  const handleSheetsCreate = async () => {
    if (!tenant?.id) return;
    if (!calStatus?.connected) {
      showMsg(
        'Connect Google Calendar first — it shares the same login.',
        false
      );
      return;
    }
    setConnecting('sheets');
    try {
      const r = await api.post(`/tenants/${tenant.id}/sheets/create`, {});
      if (!r.success) {
        showMsg(r.error || 'Failed to create sheet', false);
        return;
      }
      await loadStatus();
      showMsg('Google Sheet created and synced!');
    } catch (e: any) {
      showMsg('Failed: ' + e.message, false);
    }
    setConnecting(null);
  };

  const handleSheetsLink = async () => {
    const id = sheetIdInput.trim();
    if (!id) return;
    setConnecting('sheets');
    try {
      // Accept full URL or just the ID
      const parsed = id.includes('/d/') ? id.split('/d/')[1].split('/')[0] : id;
      const r = await api.post(`/tenants/${tenant.id}/sheets/link`, {
        spreadsheetId: parsed,
      });
      if (!r.success) {
        showMsg(r.error || 'Could not link sheet', false);
        return;
      }
      await loadStatus();
      setShowLinkInput(false);
      setSheetIdInput('');
      showMsg('Google Sheet linked!');
    } catch (e: any) {
      showMsg('Failed: ' + e.message, false);
    }
    setConnecting(null);
  };

  const handleSheetsSync = async () => {
    if (!tenant?.id) return;
    setSyncing(true);
    try {
      const r = await api.post(`/tenants/${tenant.id}/sheets/sync`, {});
      if (!r.success) {
        showMsg(r.error || 'Sync failed', false);
        return;
      }
      await loadStatus();
      showMsg(`Synced ${r.rowsSynced} rows to Google Sheets`);
    } catch (e: any) {
      showMsg('Sync failed: ' + e.message, false);
    }
    setSyncing(false);
  };

  const handleSheetsDisconnect = async () => {
    if (!confirm('Disconnect Google Sheets?')) return;
    await api.delete(`/tenants/${tenant.id}/sheets`).catch(() => {});
    setSheetsStatus({ connected: false });
    showMsg('Google Sheets disconnected.');
  };

  // ── Excel Export ─────────────────────────────────────────────────────────
  const handleExcelExport = async () => {
    if (!tenant?.id) return;
    setExporting(true);
    try {
      const [callsRes, bookingsRes, ordersRes, analyticsRes] =
        await Promise.all([
          api.get(`/tenants/${tenant.id}/calls`),
          api.get(`/tenants/${tenant.id}/bookings`),
          api.get(`/tenants/${tenant.id}/orders`),
          api.get(`/tenants/${tenant.id}/analytics`),
        ]);

      const wb = XLSX.utils.book_new();

      // Call Logs sheet
      const callRows = (callsRes.calls || []).map((c: any) => ({
        Date: c.createdAt?.slice(0, 10) || '',
        'Caller Number': c.callerNumber || '',
        Direction: c.direction || 'inbound',
        'Duration (s)': c.durationSeconds || 0,
        Outcome: c.outcome || '',
        Summary: c.summary || '',
        'Conversation ID': c.conversationId || '',
      }));
      const wsC = XLSX.utils.json_to_sheet(
        callRows.length
          ? callRows
          : [
              {
                Date: '',
                'Caller Number': '',
                Direction: '',
                'Duration (s)': '',
                Outcome: '',
                Summary: '',
              },
            ]
      );
      styleSheetHeader(wsC, callRows.length ? callRows : [{}]);
      XLSX.utils.book_append_sheet(wb, wsC, 'Call Logs');

      // Bookings sheet
      const bookingRows = (bookingsRes.bookings || []).map((b: any) => ({
        Date: b.createdAt?.slice(0, 10) || '',
        'Customer Name': b.callerName || '',
        Phone: b.callerPhone || '',
        Service: b.service || '',
        'Slot Start': b.slotStart || '',
        'Slot End': b.slotEnd || '',
        Status: b.status || '',
        'Google Event ID': b.googleEventId || '',
      }));
      const wsB = XLSX.utils.json_to_sheet(
        bookingRows.length ? bookingRows : [{}]
      );
      XLSX.utils.book_append_sheet(wb, wsB, 'Bookings');

      // Orders sheet
      const orderRows = (ordersRes.orders || []).map((o: any) => ({
        'Order #': o.orderNumber || '',
        Customer: o.customerName || '',
        Phone: o.customerPhone || '',
        Items: o.itemsSummary || '',
        'Total (₹)': o.total || 0,
        Status: o.status || '',
        'Expected Delivery': o.expectedDelivery || '',
      }));
      const wsO = XLSX.utils.json_to_sheet(orderRows.length ? orderRows : [{}]);
      XLSX.utils.book_append_sheet(wb, wsO, 'Orders');

      // Analytics sheet
      const a = analyticsRes;
      const analyticsRows = [
        { Metric: 'Total Calls', Value: a.totalCalls || 0 },
        { Metric: 'Completed Calls', Value: a.completedCalls || 0 },
        { Metric: 'Escalated Calls', Value: a.escalatedCalls || 0 },
        { Metric: 'Resolution Rate (%)', Value: a.resolutionRate || 0 },
        { Metric: 'Avg Duration (s)', Value: a.avgDuration || 0 },
        { Metric: 'Total Bookings', Value: a.totalBookings || 0 },
        { Metric: 'Exported At', Value: new Date().toLocaleString('en-IN') },
        { Metric: 'Tenant', Value: tenant.name || '' },
      ];
      const wsA = XLSX.utils.json_to_sheet(analyticsRows);
      XLSX.utils.book_append_sheet(wb, wsA, 'Analytics');

      // Download
      const filename = `VoiceOS_${(tenant.name || 'export').replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.xlsx`;
      XLSX.writeFile(wb, filename);
      showMsg(`Downloaded ${filename}`);
    } catch (e: any) {
      showMsg('Export failed: ' + e.message, false);
    }
    setExporting(false);
  };

  function styleSheetHeader(ws: XLSX.WorkSheet, rows: any[]) {
    const cols = Object.keys(rows[0] || {});
    ws['!cols'] = cols.map(() => ({ wch: 20 }));
  }

  if (!tenant)
    return (
      <div className="p-8 text-sm text-[#475569]">
        Select a workspace first.
      </div>
    );

  return (
    <div className="p-6 max-w-3xl space-y-5">
      <div className="mb-2">
        <h1 className="text-xl font-semibold">Integrations</h1>
        <p className="text-sm text-[#475569] mt-0.5">
          Connect tools to extend your agent's capabilities
        </p>
      </div>

      {msg && (
        <div
          className={`text-xs px-4 py-3 rounded-xl ${msg.ok ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}
        >
          {msg.text}
        </div>
      )}

      {/* ── Tier 1 Core Integrations ── */}
      <div className="text-xs font-medium text-[#475569] uppercase tracking-wide mb-3">
        Tier 1 Integrations
      </div>

      {/* ── Shopify ── */}
      <IntCard
        icon={<ShopifyIcon />}
        title="Shopify"
        category="E-commerce"
        desc="Sync products, inventory, track orders, and process returns during live calls."
        connected={tenant?.shopifyConnected} // Dummy check
        loading={loading}
        onConnect={() =>
          showMsg(
            'Shopify integration is managed via the Agent Studio Tools tab.'
          )
        }
        onDisconnect={() => showMsg('Cannot disconnect from here.')}
        connectLabel="Manage in Agent Studio"
        connectedDetail={
          tenant?.shopifyConnected
            ? 'Syncing orders & checking inventory live'
            : undefined
        }
      />

      {/* ── Google Calendar ── */}
      <IntCard
        icon={<CalIcon />}
        title="Google Calendar"
        category="Calendar"
        desc="Real-time slot availability and automatic event creation when agent books appointments."
        connected={calStatus?.connected}
        loading={loading || connecting === 'calendar'}
        badge={
          calStatus?.connected ? calStatus.calendarId || 'primary' : undefined
        }
        onConnect={handleCalConnect}
        onDisconnect={handleCalDisconnect}
        connectLabel="Connect Calendar"
        connectedDetail={
          calStatus?.connected
            ? 'Calendar connected — agent uses real availability'
            : undefined
        }
      />

      {/* ── Google Sheets ── */}
      <div className="mt-8 text-xs font-medium text-[#475569] uppercase tracking-wide mb-3">
        Data & Export
      </div>
      <div
        className={`bg-[#0F1623] border rounded-2xl p-5 transition-colors ${sheetsStatus?.connected ? 'border-emerald-500/30' : 'border-[#1E2A3E]'}`}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0d2414] border border-emerald-500/20 flex items-center justify-center text-lg shrink-0">
              <SheetsIcon />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm">Google Sheets</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-[#1E2A3E] text-[#475569]">
                  CRM
                </span>
                {sheetsStatus?.connected && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Connected
                  </span>
                )}
              </div>
              <p className="text-xs text-[#475569] mt-0.5">
                Auto-sync all call logs, bookings, orders, and analytics to a
                live Google Sheet. Syncs after every booking.
              </p>
            </div>
          </div>

          {!sheetsStatus?.connected ? (
            <div className="flex items-center gap-2 shrink-0">
              {!calStatus?.connected && (
                <span className="text-xs text-amber-400">
                  Connect Calendar first
                </span>
              )}
              <button
                onClick={handleSheetsCreate}
                disabled={connecting === 'sheets' || !calStatus?.connected}
                className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white text-xs px-4 py-2 rounded-xl transition-colors whitespace-nowrap"
              >
                {connecting === 'sheets' ? 'Creating…' : 'Create Sheet'}
              </button>
              <button
                onClick={() => setShowLinkInput((v) => !v)}
                className="bg-[#1E2A3E] hover:bg-[#2A3A54] text-[#94A3B8] text-xs px-3 py-2 rounded-xl transition-colors"
              >
                Link existing
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleSheetsSync}
                disabled={syncing}
                className="bg-[#1E2A3E] hover:bg-[#2A3A54] disabled:opacity-40 text-[#94A3B8] text-xs px-3 py-2 rounded-xl transition-colors"
              >
                {syncing ? 'Syncing…' : 'Sync Now'}
              </button>
              {sheetsStatus.spreadsheetUrl && (
                <a
                  href={sheetsStatus.spreadsheetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-400 text-xs px-3 py-2 rounded-xl transition-colors border border-emerald-500/20"
                >
                  Open Sheet ↗
                </a>
              )}
              <button
                onClick={handleSheetsDisconnect}
                className="text-[#475569] hover:text-red-400 text-xs px-3 py-2 rounded-xl transition-colors"
              >
                Disconnect
              </button>
            </div>
          )}
        </div>

        {/* Link existing sheet input */}
        {showLinkInput && !sheetsStatus?.connected && (
          <div className="mt-4 flex gap-2">
            <input
              value={sheetIdInput}
              onChange={(e) => setSheetIdInput(e.target.value)}
              placeholder="Paste Google Sheet URL or ID"
              className="flex-1 bg-[#080C14] border border-[#1E2A3E] focus:border-emerald-500 rounded-xl px-3 py-2 text-sm text-white placeholder-[#475569] outline-none transition-colors"
            />
            <button
              onClick={handleSheetsLink}
              disabled={connecting === 'sheets' || !sheetIdInput.trim()}
              className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white text-xs px-4 py-2 rounded-xl transition-colors"
            >
              {connecting === 'sheets' ? 'Linking…' : 'Link'}
            </button>
            <button
              onClick={() => setShowLinkInput(false)}
              className="text-[#475569] text-xs px-3 py-2"
            >
              Cancel
            </button>
          </div>
        )}

        {/* Connected detail */}
        {sheetsStatus?.connected && (
          <div className="mt-4 grid grid-cols-3 gap-3">
            <InfoTile
              label="Sheet ID"
              value={sheetsStatus.spreadsheetId?.slice(0, 24) + '…' || '—'}
              mono
            />
            <InfoTile
              label="Last Synced"
              value={
                sheetsStatus.lastSync
                  ? new Date(sheetsStatus.lastSync).toLocaleString('en-IN', {
                      day: '2-digit',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                  : 'Never'
              }
            />
            <InfoTile label="Auto-sync" value="After every booking" />
          </div>
        )}

        {/* Sheet tabs description */}
        {sheetsStatus?.connected && (
          <div className="mt-4 border-t border-[#1E2A3E] pt-4 grid grid-cols-4 gap-2">
            {[
              {
                tab: 'Call Logs',
                cols: 'Date, Caller, Duration, Outcome, Summary',
              },
              {
                tab: 'Bookings',
                cols: 'Customer, Phone, Service, Slot, Status',
              },
              {
                tab: 'Orders',
                cols: 'Order #, Customer, Items, Total, Status',
              },
              {
                tab: 'Analytics',
                cols: 'Total calls, Resolution rate, Avg duration',
              },
            ].map(({ tab, cols }) => (
              <div key={tab} className="bg-[#080C14] rounded-xl p-3">
                <div className="text-xs font-medium text-emerald-400 mb-1">
                  {tab}
                </div>
                <div className="text-xs text-[#475569] leading-relaxed">
                  {cols}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Excel Export ── */}
      <div className="bg-[#0F1623] border border-[#1E2A3E] rounded-2xl p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0d1f14] border border-[#1a4d2a] flex items-center justify-center shrink-0">
              <ExcelIcon />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm">Excel Export</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-[#1E2A3E] text-[#475569]">
                  Export
                </span>
              </div>
              <p className="text-xs text-[#475569] mt-0.5">
                Download a .xlsx file with all data — Call Logs, Bookings,
                Orders, Analytics. Opens directly in Excel or Google Sheets.
              </p>
            </div>
          </div>
          <button
            onClick={handleExcelExport}
            disabled={exporting}
            className="bg-[#1a4d2a] hover:bg-[#1f5c32] disabled:opacity-40 text-emerald-300 text-xs px-4 py-2 rounded-xl transition-colors border border-[#1a4d2a] shrink-0 whitespace-nowrap"
          >
            {exporting ? 'Generating…' : 'Download .xlsx'}
          </button>
        </div>
        <div className="mt-4 grid grid-cols-4 gap-2">
          {['Call Logs', 'Bookings', 'Orders', 'Analytics'].map((t) => (
            <div
              key={t}
              className="bg-[#080C14] border border-[#1E2A3E] rounded-lg px-3 py-2 text-xs text-[#475569] text-center"
            >
              {t}
            </div>
          ))}
        </div>
      </div>

      {/* ── Core integrations (read-only status) ── */}
      <div className="border-t border-[#1E2A3E] pt-5">
        <div className="text-xs font-medium text-[#475569] uppercase tracking-wide mb-3">
          Core (Auto-configured)
        </div>
        <div className="grid grid-cols-2 gap-3">
          <CoreCard
            icon="🎙"
            title="ElevenLabs ConvAI"
            desc="Voice engine + STT + TTS + agent orchestration"
            status="Live"
          />
          <CoreCard
            icon="📞"
            title="Twilio"
            desc={`Phone ${tenant.phoneNumber || '+17407465110'} — inbound + outbound`}
            status="Live"
          />
        </div>
      </div>

      {/* ── Coming soon ── */}
      <div className="border-t border-[#1E2A3E] pt-5">
        <div className="text-xs font-medium text-[#475569] uppercase tracking-wide mb-3">
          Coming Soon
        </div>
        <div className="grid grid-cols-2 gap-3">
          <CoreCard
            icon="💬"
            title="Slack Alerts"
            desc="Notify your team when calls escalate"
            status="Soon"
          />
          <CoreCard
            icon="📱"
            title="WhatsApp Business"
            desc="Same agent on WhatsApp via ElevenLabs"
            status="Soon"
          />
          <CoreCard
            icon="🔁"
            title="n8n / Zapier"
            desc="Connect any app via webhook automation"
            status="Soon"
          />
          <CoreCard
            icon="☁️"
            title="HubSpot CRM"
            desc="Auto-push contacts and call summaries"
            status="Soon"
          />
        </div>
      </div>
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────

function IntCard({
  icon,
  title,
  category,
  desc,
  connected,
  loading,
  badge,
  onConnect,
  onDisconnect,
  connectLabel,
  connectedDetail,
}: any) {
  return (
    <div
      className={`bg-[#0F1623] border rounded-2xl p-5 transition-colors ${connected ? 'border-blue-500/30' : 'border-[#1E2A3E]'}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-xl border flex items-center justify-center text-xl shrink-0 ${connected ? 'bg-blue-500/10 border-blue-500/20' : 'bg-[#1E2A3E] border-[#2A3A54]'}`}
          >
            {icon}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-medium text-sm">{title}</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-[#1E2A3E] text-[#475569]">
                {category}
              </span>
              {connected && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  Connected
                </span>
              )}
            </div>
            <p className="text-xs text-[#475569] mt-0.5">{desc}</p>
          </div>
        </div>
        <div className="shrink-0">
          {connected ? (
            <button
              onClick={onDisconnect}
              className="text-[#475569] hover:text-red-400 text-xs px-3 py-2 rounded-xl transition-colors border border-[#1E2A3E] hover:border-red-500/20"
            >
              Disconnect
            </button>
          ) : (
            <button
              onClick={onConnect}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white text-xs px-4 py-2 rounded-xl transition-colors"
            >
              {loading ? 'Connecting…' : connectLabel}
            </button>
          )}
        </div>
      </div>
      {connectedDetail && (
        <div className="mt-3 text-xs text-[#475569] bg-[#080C14] rounded-lg px-3 py-2">
          {connectedDetail}
        </div>
      )}
    </div>
  );
}

function CoreCard({ icon, title, desc, status }: any) {
  return (
    <div className="bg-[#080C14] border border-[#1E2A3E] rounded-xl p-4 flex items-center gap-3">
      <span className="text-xl">{icon}</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-[#94A3B8]">{title}</span>
          <span
            className={`text-xs px-2 py-0.5 rounded-full ${status === 'Live' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-[#1E2A3E] text-[#475569]'}`}
          >
            {status}
          </span>
        </div>
        <p className="text-xs text-[#475569] mt-0.5 truncate">{desc}</p>
      </div>
    </div>
  );
}

function InfoTile({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="bg-[#080C14] rounded-xl px-3 py-2.5">
      <div className="text-xs text-[#475569] mb-0.5">{label}</div>
      <div
        className={`text-xs font-medium text-white truncate ${mono ? 'font-mono' : ''}`}
      >
        {value}
      </div>
    </div>
  );
}

function CalIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <rect
        x="3"
        y="4"
        width="18"
        height="18"
        rx="2"
        stroke="#3b82f6"
        strokeWidth="1.5"
      />
      <path
        d="M16 2v4M8 2v4M3 10h18"
        stroke="#3b82f6"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <rect x="7" y="14" width="3" height="3" rx="0.5" fill="#3b82f6" />
      <rect
        x="11"
        y="14"
        width="3"
        height="3"
        rx="0.5"
        fill="#3b82f6"
        opacity="0.5"
      />
    </svg>
  );
}

function SheetsIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <rect
        x="3"
        y="3"
        width="18"
        height="18"
        rx="2"
        stroke="#22c55e"
        strokeWidth="1.5"
      />
      <path
        d="M3 9h18M3 15h18M9 3v18M15 3v18"
        stroke="#22c55e"
        strokeWidth="1"
        opacity="0.5"
      />
      <rect x="9" y="9" width="6" height="6" fill="#22c55e" opacity="0.15" />
    </svg>
  );
}

function ExcelIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <rect
        x="3"
        y="3"
        width="18"
        height="18"
        rx="2"
        fill="#1a4d2a"
        stroke="#22c55e"
        strokeWidth="1.5"
      />
      <path
        d="M7 8l3 4-3 4M13 8h4M13 12h3M13 16h4"
        stroke="#4ade80"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ShopifyIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path
        d="M6.5 4.5l11-2 2 12.5-13 4-2-14.5z"
        fill="#95BF47"
        opacity="0.2"
      />
      <path
        d="M8 8V6a4 4 0 0 1 8 0v2m-9 1l-1 11h12l-1-11H7z"
        stroke="#95BF47"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
