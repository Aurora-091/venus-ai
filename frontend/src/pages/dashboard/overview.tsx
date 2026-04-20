import { useEffect, useState } from "react";
import { Link } from "wouter";
import { api } from "../../lib/api";

interface Props {
  tenant?: any;
  tenants?: any[];
}

interface Analytics {
  totalCalls: number;
  completedCalls: number;
  escalatedCalls: number;
  totalBookings: number;
  avgDuration: number;
  resolutionRate: number;
  callsByDay: { date: string; count: number }[];
}

function StatCard({ label, value, sub, accent }: { label: string; value: string | number; sub?: string; accent?: string }) {
  return (
    <div className="bg-[#0F1623] border border-[#1E2A3E] rounded-2xl p-5">
      <div className="text-xs text-[#475569] mb-2">{label}</div>
      <div className={`text-2xl font-semibold font-mono ${accent || "text-white"}`}>{value}</div>
      {sub && <div className="text-xs text-[#475569] mt-1">{sub}</div>}
    </div>
  );
}

function MiniBarChart({ data }: { data: { date: string; count: number }[] }) {
  const chartData = data || [];
  const max = Math.max(...chartData.map(d => d.count), 1);
  return (
    <div className="flex items-end gap-1 h-16">
      {chartData.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <div
            className="w-full rounded-sm bg-blue-600/70 transition-all"
            style={{ height: `${Math.round((d.count / max) * 52)}px`, minHeight: d.count > 0 ? "4px" : "2px" }}
            title={`${d.date}: ${d.count} calls`}
          />
          <span className="text-[9px] text-[#475569]">{d.date.slice(5)}</span>
        </div>
      ))}
    </div>
  );
}

export default function Overview({ tenant }: Props) {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [calls, setCalls] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!tenant?.id) return;
    setLoading(true);
    Promise.all([
      api.get(`/tenants/${tenant.id}/analytics`),
      api.get(`/tenants/${tenant.id}/calls`),
    ]).then(([a, c]) => {
      setAnalytics(a);
      setCalls((c.calls || []).slice(0, 5));
    }).catch(() => {}).finally(() => setLoading(false));
  }, [tenant?.id]);

  if (!tenant) {
    return (
      <div className="p-8">
        <div className="max-w-md mx-auto text-center mt-20">
          <div className="w-16 h-16 rounded-2xl bg-[#0F1623] border border-[#1E2A3E] flex items-center justify-center text-3xl mx-auto mb-4">◈</div>
          <h2 className="text-lg font-semibold mb-2">No workspace yet</h2>
          <p className="text-sm text-[#475569] mb-6">Create your first AI voice agent to get started.</p>
          <Link href="/onboarding" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-colors">
            Set up workspace →
          </Link>
        </div>
      </div>
    );
  }

  const verticalColor = { clinic: "text-emerald-400", hotel: "text-blue-400", ecommerce: "text-violet-400" }[tenant.vertical || ""] || "text-blue-400";

  return (
    <div className="p-6 max-w-5xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-semibold">Overview</h1>
        <p className="text-sm text-[#475569] mt-0.5">{tenant.name} — <span className={`${verticalColor}`}>{tenant.vertical}</span></p>
      </div>

      {/* Agent status banner */}
      {tenant.agentStatus !== "active" && (
        <div className="mb-5 bg-amber-500/10 border border-amber-500/30 rounded-xl px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="text-amber-400">⚠</span>
            <div>
              <div className="text-sm font-medium text-amber-300">Agent not configured</div>
              <div className="text-xs text-[#94A3B8]">Connect ElevenLabs to activate your voice agent</div>
            </div>
          </div>
          <Link href="/dashboard/agent" className="text-xs bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 px-3 py-1.5 rounded-lg transition-colors">
            Set up agent →
          </Link>
        </div>
      )}

      {/* Stats */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-[#111] border border-[#222] rounded-xl p-5 animate-pulse h-24" />
          ))}
        </div>
      ) : analytics ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <StatCard label="Total Calls" value={analytics.totalCalls} sub="All time" />
          <StatCard label="Resolution Rate" value={`${analytics.resolutionRate}%`} sub="Calls resolved by AI" accent="text-gray-300" />
          <StatCard label="Avg Duration" value={`${analytics.avgDuration}s`} sub="Per call" />
          {tenant.vertical === "ecommerce" ? (
            <StatCard label="Orders Tracked" value={analytics.totalBookings || 0} sub="Via voice agent" accent="text-gray-300" />
          ) : (
            <StatCard label="Bookings" value={analytics.totalBookings || 0} sub="Via voice agent" accent="text-gray-300" />
          )}
        </div>
      ) : null}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Call volume chart */}
        {analytics && (
          <div className="md:col-span-2 bg-[#0F1623] border border-[#1E2A3E] rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm font-medium">Call volume — last 7 days</div>
              <Link href="/dashboard/calls" className="text-xs text-blue-400 hover:text-blue-300 transition-colors">View all →</Link>
            </div>
            <MiniBarChart data={analytics.callsByDay || []} />
          </div>
        )}

        {/* Dynamic Sector Widget */}
        {tenant.vertical === "ecommerce" ? (
          <div className="bg-[#0F1623] border border-[#1E2A3E] rounded-2xl p-5 flex flex-col justify-between">
            <div>
              <div className="text-sm font-medium mb-1">Top Inquiries</div>
              <p className="text-xs text-[#475569] mb-4">Most common order issues detected</p>
              <div className="space-y-3">
                {[
                  { label: "Where is my order?", pct: "45%" },
                  { label: "Return/Refund", pct: "25%" },
                  { label: "Product sizing", pct: "15%" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <span className="text-sm text-[#94A3B8]">{item.label}</span>
                    <span className="text-xs font-mono">{item.pct}</span>
                  </div>
                ))}
              </div>
            </div>
            <Link href="/dashboard/agent" className="text-xs text-blue-400 hover:text-blue-300 transition-colors mt-4 block">Train Agent →</Link>
          </div>
        ) : tenant.vertical === "clinic" ? (
          <div className="bg-[#0F1623] border border-[#1E2A3E] rounded-2xl p-5 flex flex-col justify-between">
            <div>
              <div className="text-sm font-medium mb-1">Appointment Types</div>
              <p className="text-xs text-[#475569] mb-4">Most booked services this week</p>
              <div className="space-y-3">
                {[
                  { label: "General Checkup", pct: "50%" },
                  { label: "Follow-up", pct: "30%" },
                  { label: "Consultation", pct: "10%" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <span className="text-sm text-[#94A3B8]">{item.label}</span>
                    <span className="text-xs font-mono">{item.pct}</span>
                  </div>
                ))}
              </div>
            </div>
            <Link href="/dashboard/bookings" className="text-xs text-blue-400 hover:text-blue-300 transition-colors mt-4 block">View Calendar →</Link>
          </div>
        ) : (
          <div className="bg-[#0F1623] border border-[#1E2A3E] rounded-2xl p-5 flex flex-col justify-between">
            <div>
              <div className="text-sm font-medium mb-1">Booking Intent</div>
              <p className="text-xs text-[#475569] mb-4">Caller intents detected this week</p>
              <div className="space-y-3">
                {[
                  { label: "New Reservation", pct: "60%" },
                  { label: "Modification/Cancel", pct: "20%" },
                  { label: "General Query", pct: "15%" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <span className="text-sm text-[#94A3B8]">{item.label}</span>
                    <span className="text-xs font-mono">{item.pct}</span>
                  </div>
                ))}
              </div>
            </div>
            <Link href="/dashboard/bookings" className="text-xs text-blue-400 hover:text-blue-300 transition-colors mt-4 block">View Bookings →</Link>
          </div>
        )}
      </div>

      {/* Recent calls */}
      <div className="bg-[#0F1623] border border-[#1E2A3E] rounded-2xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#1E2A3E]">
          <div className="text-sm font-medium">Recent calls</div>
          <Link href="/dashboard/calls" className="text-xs text-blue-400 hover:text-blue-300 transition-colors">View all →</Link>
        </div>
        {calls.length === 0 ? (
          <div className="px-5 py-10 text-center text-sm text-[#475569]">No calls yet. Your agent is ready to answer.</div>
        ) : (
          <div className="divide-y divide-[#1E2A3E]">
            {calls.map((call, i) => (
              <div key={call.id || i} className="flex items-center justify-between px-5 py-3.5">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${call.outcome === "completed" ? "bg-emerald-400" : call.outcome === "escalated" ? "bg-amber-400" : "bg-[#475569]"}`} />
                  <div>
                    <div className="text-sm font-mono">{call.callerNumber || "Unknown"}</div>
                    <div className="text-xs text-[#475569] mt-0.5 max-w-xs truncate">{call.summary || "—"}</div>
                  </div>
                </div>
                <div className="flex items-center gap-4 shrink-0">
                  {call.durationSeconds && (
                    <span className="text-xs font-mono text-[#475569]">{call.durationSeconds}s</span>
                  )}
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    call.outcome === "completed" ? "bg-emerald-500/10 text-emerald-400" :
                    call.outcome === "escalated" ? "bg-amber-500/10 text-amber-400" :
                    "bg-[#1E2A3E] text-[#475569]"
                  }`}>{call.outcome || "unknown"}</span>
                  <span className="text-xs text-[#475569]">{call.createdAt?.slice(0, 10)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
