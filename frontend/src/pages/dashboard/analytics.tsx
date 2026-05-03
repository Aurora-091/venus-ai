import { useCallback, useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { useSupabaseCallRealtime } from '../../hooks/useSupabaseCallRealtime';

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

function BarChart({
  data,
  label,
}: {
  data: { date: string; count: number }[];
  label: string;
}) {
  const chartData = data || [];
  const max = Math.max(...chartData.map((d) => d.count), 1);
  return (
    <div>
      <div className="text-xs text-[#475569] mb-3">{label}</div>
      <div className="flex items-end gap-1.5 h-24">
        {chartData.map((d, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            <div className="text-[9px] text-[#475569] font-mono">
              {d.count > 0 ? d.count : ''}
            </div>
            <div
              className="w-full rounded-t-sm bg-blue-600/70 hover:bg-blue-500 transition-all cursor-default"
              style={{
                height: `${Math.max(Math.round((d.count / max) * 64), d.count > 0 ? 4 : 2)}px`,
              }}
              title={`${d.date}: ${d.count}`}
            />
            <div className="text-[9px] text-[#475569]">{d.date.slice(5)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function DonutRing({
  value,
  color,
  label,
}: {
  value: number;
  color: string;
  label: string;
}) {
  const r = 36;
  const circ = 2 * Math.PI * r;
  const dash = (value / 100) * circ;
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-24 h-24">
        <svg viewBox="0 0 88 88" className="w-24 h-24 -rotate-90">
          <circle
            cx="44"
            cy="44"
            r={r}
            fill="none"
            stroke="#1E2A3E"
            strokeWidth="8"
          />
          <circle
            cx="44"
            cy="44"
            r={r}
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeDasharray={`${dash} ${circ}`}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center text-lg font-mono font-semibold">
          {value}%
        </div>
      </div>
      <div className="text-xs text-[#475569]">{label}</div>
    </div>
  );
}

export default function Analytics({ tenant }: Props) {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    if (!tenant?.id) return;
    setLoading(true);
    api
      .get(`/tenants/${tenant.id}/analytics`)
      .then((r) => setAnalytics(r))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [tenant?.id]);

  useSupabaseCallRealtime(tenant?.id, load);

  useEffect(() => {
    load();
  }, [load]);

  if (!tenant) {
    return (
      <div className="p-8 text-sm text-[#475569]">Select a workspace.</div>
    );
  }

  return (
    <div className="p-6 max-w-5xl">
      <div className="mb-6">
        <h1 className="text-xl font-semibold">Analytics</h1>
        <p className="text-sm text-[#475569] mt-0.5">{tenant.name}</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="bg-[#0F1623] border border-[#1E2A3E] rounded-2xl h-24 animate-pulse"
            />
          ))}
        </div>
      ) : analytics ? (
        <>
          {/* KPI row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {[
              {
                label: 'Total Calls',
                value: analytics.totalCalls,
                color: 'text-white',
              },
              {
                label: 'Resolved by AI',
                value: analytics.completedCalls,
                color: 'text-emerald-400',
              },
              {
                label: 'Escalated',
                value: analytics.escalatedCalls,
                color: 'text-amber-400',
              },
              {
                label: 'Avg Duration',
                value: `${analytics.avgDuration}s`,
                color: 'text-blue-400',
              },
            ].map((s) => (
              <div
                key={s.label}
                className="bg-[#0F1623] border border-[#1E2A3E] rounded-2xl p-5"
              >
                <div className="text-xs text-[#475569] mb-2">{s.label}</div>
                <div className={`text-2xl font-semibold font-mono ${s.color}`}>
                  {s.value}
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {/* Bar chart */}
            <div className="md:col-span-2 bg-[#0F1623] border border-[#1E2A3E] rounded-2xl p-5">
              <BarChart
                data={analytics.callsByDay || []}
                label="Calls per day — last 7 days"
              />
            </div>

            {/* Resolution donuts */}
            <div className="bg-[#0F1623] border border-[#1E2A3E] rounded-2xl p-5 flex flex-col items-center justify-center gap-4">
              <div className="text-xs text-[#475569]">Resolution breakdown</div>
              <div className="flex gap-6">
                <DonutRing
                  value={analytics.resolutionRate}
                  color="#22c55e"
                  label="Resolved"
                />
                <DonutRing
                  value={
                    analytics.totalCalls > 0
                      ? Math.round(
                          (analytics.escalatedCalls / analytics.totalCalls) *
                            100
                        )
                      : 0
                  }
                  color="#f59e0b"
                  label="Escalated"
                />
              </div>
            </div>
          </div>

          {/* Bookings */}
          <div className="bg-[#0F1623] border border-[#1E2A3E] rounded-2xl p-5">
            <div className="text-sm font-medium mb-4">Bookings via agent</div>
            <div className="flex items-center gap-6">
              <div>
                <div className="text-3xl font-mono font-semibold text-blue-400">
                  {analytics.totalBookings}
                </div>
                <div className="text-xs text-[#475569] mt-1">
                  Total bookings
                </div>
              </div>
              {analytics.totalCalls > 0 && (
                <div>
                  <div className="text-3xl font-mono font-semibold text-violet-400">
                    {Math.round(
                      (analytics.totalBookings / analytics.completedCalls ||
                        0) * 100
                    )}
                    %
                  </div>
                  <div className="text-xs text-[#475569] mt-1">
                    Booking conversion
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      ) : (
        <div className="text-sm text-[#475569]">No data available yet.</div>
      )}
    </div>
  );
}
